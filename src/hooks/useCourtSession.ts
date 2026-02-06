/**
 * useCourtSession - 庭审会话管理 Facade Hook
 * 
 * 组合 useTrialState 和 useWebSocket，提供统一的 API 给 UI 组件。
 * 这是一个瘦层，主要是胶水代码和事件处理器绑定。
 * 
 */
import { useCallback, useMemo } from 'react';
import { useTrialState, NODE_TO_PHASE, inferUIRole, extractSpeakerName, nodeNameToActiveNode, INITIAL_INTERRUPT_STATE } from './useTrialState';
import { useWebSocket } from './useWebSocket';
import type {
    Message,
    UIRole,
    SessionState,
    SessionActions,
    UseCourtSessionReturn,
    UserRole,
    BackendRole,
    CaseInfo,
    BackendEvidence,
    NodeExecutedData,
    InterruptRequestData,
    SessionCreatedData,
    TrialCompletedData,
    ErrorData,
    EvidenceInputPayload
} from '../types';

// =============================================================================
// 常量
// =============================================================================

const ROLE_MAPPINGS: Record<UserRole, BackendRole> = {
    'Prosecutor AI': '原告律师',
    'Defense AI': '被告律师',
    'Judge AI': '法官',
    'Observer': null
};

const BACKEND_TO_UI_ROLE: Record<string, UIRole> = {
    '原告律师': 'prosecutor',
    'B(原告律师)': 'prosecutor',
    '被告律师': 'defense',
    'C(被告律师)': 'defense',
    '法官': 'judge',
    'A(法官)': 'judge',
    '审判长': 'judge',
    '书记员': 'clerk',
    '公诉人': 'prosecutor',
    '被告人': 'defense',
    '辩护人': 'defense',
    'System': 'system',
    'User': 'user'
};

// =============================================================================
// Hook
// =============================================================================

export function useCourtSession(): UseCourtSessionReturn {
    // 组合子 Hooks
    const { state, dispatch, addMessage, addLog, processedMessageCountRef, processedContentSetRef } = useTrialState();
    const { connect: wsConnect, disconnect: wsDisconnect, sendUserInput } = useWebSocket();

    // --- WebSocket 事件处理器 ---

    const handleSessionCreated = useCallback((data: SessionCreatedData) => {
        dispatch({
            type: 'SESSION_CREATED',
            payload: { sessionId: data.thread_id, threadId: data.thread_id }
        });
        addLog(`会话创建成功: ${data.thread_id.slice(0, 8)}...`);
        addMessage('system', 'System', '已连接到法庭会话，庭审即将开始...');
    }, [dispatch, addLog, addMessage]);

    const handleNodeExecuted = useCallback((data: NodeExecutedData) => {
        const nodeName = data.node_name;
        addLog(`节点执行: ${nodeName} (进度: ${data.progress.toFixed(1)}%)`);

        // 使用单个 dispatch 更新所有相关状态
        dispatch({
            type: 'NODE_EXECUTED',
            payload: {
                nodeName,
                progress: data.progress,
                phase: NODE_TO_PHASE[nodeName] || data.current_phase,
                focus: data.focus,
                rounds: data.rounds,
                activeNode: nodeNameToActiveNode(nodeName)
            }
        });

        // 处理新消息
        if (data.messages && data.messages.length > 0) {
            const totalBackendMessages = data.message_count || 0;
            const alreadyProcessed = processedMessageCountRef.current;
            const newMessageCount = totalBackendMessages - alreadyProcessed;
            const newMessages = data.messages.slice(-newMessageCount);

            newMessages.forEach(msg => {
                if (msg.type === 'human') return;

                // 使用 ref 进行去重，避免闭包问题
                const contentHash = `${msg.name || ''}::${msg.content?.slice(0, 100) || ''}`;
                if (processedContentSetRef.current.has(contentHash)) {
                    console.log('[handleNodeExecuted] Skipping duplicate:', contentHash.slice(0, 50));
                    return;
                }
                processedContentSetRef.current.add(contentHash);

                const role = inferUIRole(msg.name);
                const name = msg.name || extractSpeakerName(msg.content, msg.name);
                addMessage(role, name, msg.content, false, nodeName);
            });

            processedMessageCountRef.current = totalBackendMessages;
        }
    }, [dispatch, addLog, addMessage, processedMessageCountRef, processedContentSetRef]);

    const handleInterruptRequest = useCallback((data: InterruptRequestData) => {
        addLog(`中断请求: ${data.node_name} (类型: ${data.input_type})`);

        dispatch({
            type: 'INTERRUPT_REQUEST',
            payload: {
                isInterrupted: true,
                nodeName: data.node_name,
                inputType: data.input_type,
                prompt: data.prompt,
                options: data.options || null,
                metadata: data.metadata
            }
        });

        addMessage('system', 'System', data.prompt);
    }, [dispatch, addLog, addMessage]);

    const handleTrialCompleted = useCallback((_data: TrialCompletedData) => {
        addLog('庭审已完成');
        dispatch({ type: 'TRIAL_COMPLETED' });
        addMessage('system', 'System', '🎉 庭审已完成！');
    }, [dispatch, addLog, addMessage]);

    const handleError = useCallback((data: ErrorData) => {
        addLog(`错误: ${data.code} - ${data.message}`);
        addMessage('system', 'Error', `❌ 错误: ${data.message}`);

        if (data.code === 'WEBSOCKET_ERROR') {
            dispatch({ type: 'CONNECTION_ERROR' });
        }
    }, [dispatch, addLog, addMessage]);

    // --- 公开动作 ---

    const connect = useCallback(async (
        _selectedRole: UserRole,
        caseInfo: CaseInfo,
        backendEvidenceList: BackendEvidence[]
    ): Promise<void> => {
        if (state.isConnected) {
            if (window.confirm("断开当前会话？")) {
                wsDisconnect();
                dispatch({ type: 'DISCONNECTED' });
                addLog("已断开。");
            }
            return;
        }

        try {
            dispatch({ type: 'SET_CONNECTING', payload: true });
            addLog('建立 WebSocket 连接中...');
            dispatch({ type: 'SET_EVIDENCE_LIST', payload: backendEvidenceList });

            await wsConnect(
                {
                    onOpen: () => addLog('WebSocket 连接已建立'),
                    onSessionCreated: handleSessionCreated,
                    onNodeExecuted: handleNodeExecuted,
                    onInterruptRequest: handleInterruptRequest,
                    onTrialCompleted: handleTrialCompleted,
                    onError: handleError,
                    onClose: () => {
                        addLog('WebSocket 连接已关闭');
                        dispatch({ type: 'DISCONNECTED' });
                    }
                },
                caseInfo,
                backendEvidenceList
            );

            addLog('发送开始庭审请求...');
        } catch (e) {
            const error = e as Error;
            addLog(`连接失败: ${error.message}`);
            alert("连接失败，请确保后端服务正在运行。");
            dispatch({ type: 'CONNECTION_ERROR' });
        }
    }, [
        state.isConnected,
        wsConnect,
        wsDisconnect,
        dispatch,
        addLog,
        handleSessionCreated,
        handleNodeExecuted,
        handleInterruptRequest,
        handleTrialCompleted,
        handleError
    ]);

    const disconnect = useCallback(async (): Promise<void> => {
        wsDisconnect();
        dispatch({ type: 'DISCONNECTED' });
        addLog("已断开。");
    }, [wsDisconnect, dispatch, addLog]);

    const clearSession = useCallback(async (): Promise<void> => {
        wsDisconnect();
        dispatch({ type: 'RESET' });
        processedMessageCountRef.current = 0;
        addLog('会话已清除。');
    }, [wsDisconnect, dispatch, addLog, processedMessageCountRef]);

    const respondToInterrupt = useCallback((
        input: boolean | string | EvidenceInputPayload
    ): void => {
        if (!state.interruptState.isInterrupted || !state.interruptState.nodeName) {
            addLog('错误: 没有活动的中断请求');
            return;
        }

        try {
            sendUserInput(state.interruptState.nodeName, input);
            addLog(`已响应中断: ${state.interruptState.nodeName}`);

            let displayContent: string;
            if (typeof input === 'boolean') {
                displayContent = input ? '✅ 是 / 有异议' : '❌ 否 / 无异议';
            } else if (typeof input === 'string') {
                displayContent = input;
            } else {
                displayContent = input.messages || '已提交证据';
            }

            addMessage('defense', '用户 (辩护代理人)', displayContent, true);
            dispatch({ type: 'CLEAR_INTERRUPT' });
        } catch (e) {
            const error = e as Error;
            addLog(`发送输入失败: ${error.message}`);
        }
    }, [state.interruptState, sendUserInput, dispatch, addLog, addMessage]);

    const sendMessage = useCallback((content: string, _selectedRole: UserRole): boolean => {
        if (!content.trim()) return false;
        if (!state.interruptState.isInterrupted) {
            addLog('警告: 当前不需要输入');
            return false;
        }

        respondToInterrupt(content);
        return true;
    }, [state.interruptState.isInterrupted, respondToInterrupt, addLog]);

    // --- 返回结构 ---

    const sessionState: SessionState = useMemo(() => ({
        messages: state.messages,
        isConnected: state.isConnected,
        isConnecting: state.isConnecting,
        sessionId: state.sessionId,
        threadId: state.threadId,
        currentPhase: state.currentPhase,
        rounds: state.rounds,
        currentSpeaker: state.currentSpeaker,
        activeNode: state.activeNode,
        isTurnToSpeak: state.isTurnToSpeak,
        logs: state.logs,
        interruptState: state.interruptState,
        progress: state.progress,
        focus: state.focus,
        evidenceList: state.evidenceList
    }), [state]);

    const actions: SessionActions = useMemo(() => ({
        connect,
        disconnect,
        clearSession,
        sendMessage,
        respondToInterrupt,
        addMessage,
        addLog
    }), [
        connect,
        disconnect,
        clearSession,
        sendMessage,
        respondToInterrupt,
        addMessage,
        addLog
    ]);

    const constants = useMemo(() => ({
        ROLE_MAPPINGS,
        BACKEND_TO_UI_ROLE,
        NODE_TO_PHASE
    }), []);

    return { sessionState, actions, constants };
}

// 导出常量以供外部使用
export { ROLE_MAPPINGS, BACKEND_TO_UI_ROLE, NODE_TO_PHASE };
