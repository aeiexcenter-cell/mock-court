import React, { useState, useMemo, useCallback } from 'react';
import DraggableWindow from './components/DraggableWindow';
import LeftSidebar from '@/features/LeftSidebar';
import ChatArea from '@/features/ChatArea';
import RightSidebar from '@/features/RightSidebar';
import { useCourtSession, ROLE_MAPPINGS } from '@/hooks/useCourtSession';
import { useWindowManager } from './hooks/useWindowManager';
import type {
    TextEvidence,
    FileEvidence,
    UserRole,
    LayoutConfig,
    CaseDataConfig,
    EvidenceDataConfig,
    NewEvidenceInputConfig,
    SessionInfoConfig,
    CaseInfo,
    BackendEvidence,
    EvidenceInputPayload
} from './types';

import { activeCase } from '@/data';

// --- 使用导入的模块化数据 ---
const DEFAULT_CASE_INFO = activeCase.meta;
const DEFAULT_EVIDENCE_LIST = activeCase.evidence;

// --- 主要应用程序组件 ---
export default function MockCourtApp(): React.ReactElement {
    // --- 会话 Hook (单行访问所有会话逻辑) ---
    const { sessionState, actions } = useCourtSession();

    // 为了方便解构
    const {
        messages, isConnected, isConnecting, sessionId,
        currentPhase, currentSpeaker, activeNode, isTurnToSpeak, logs,
        interruptState, progress, evidenceList, lastInterruptReq
    } = sessionState;

    const { connect, sendMessage, respondToInterrupt, clearSession, retry } = actions;

    // --- 窗口管理器 Hook ---
    const { windows, windowActions, inputWindow, inputWindowActions } = useWindowManager();

    // --- UI 状态 (本组件局部) ---
    const [leftWidth, setLeftWidth] = useState<number>(320);
    const [rightWidth, setRightWidth] = useState<number>(300);

    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [evidenceFilter, setEvidenceFilter] = useState<string>('all');
    const [selectedRole, setSelectedRole] = useState<UserRole>('Defense AI');

    // 输入项
    const [inputValue, setInputValue] = useState<string>('');
    const [caseContext, setCaseContext] = useState<string>(DEFAULT_CASE_INFO.abstract);

    // 将预设证据列表转换为前端格式
    const [textEvidence, setTextEvidence] = useState<TextEvidence[]>(
        DEFAULT_EVIDENCE_LIST.map(ev => ({
            id: ev.id,
            name: ev.name,
            speaker: ev.provider === 'prosecutor' ? '原告律师' : '被告律师',
            content: ev.content
        }))
    );
    const [fileEvidence, setFileEvidence] = useState<FileEvidence[]>([]);
    const [newEvidenceInput, setNewEvidenceInput] = useState<string>('');
    const [newEvidenceSpeaker, setNewEvidenceSpeaker] = useState<string>('原告律师');

    const [isLongFormMode, setIsLongFormMode] = useState<boolean>(false);

    // --- 将前端证据转换为后端格式 ---
    const convertToBackendEvidence = useCallback((): BackendEvidence[] => {
        const converted: BackendEvidence[] = [];

        textEvidence.forEach((ev, idx) => {
            converted.push({
                id: `text-${idx + 1}`,
                name: `文本证据 ${idx + 1}`,
                content: ev.content,
                provider: ev.speaker.includes('被告') ? 'defendant' : 'prosecutor'
            });
        });

        fileEvidence.forEach((ev, idx) => {
            converted.push({
                id: `file-${idx + 1}`,
                name: ev.name,
                content: `[文件证据] ${ev.name}`,
                provider: ev.speaker.includes('被告') ? 'defendant' : 'prosecutor'
            });
        });

        return converted;
    }, [textEvidence, fileEvidence]);

    // --- 动作 (使用 Hook 函数) ---
    const handleStartTrial = useCallback((): void => {
        // 使用预设测试数据（来自 demo.html）
        connect(selectedRole, DEFAULT_CASE_INFO, DEFAULT_EVIDENCE_LIST);
    }, [connect, selectedRole, caseContext, convertToBackendEvidence]);

    const handleSendMessage = useCallback((): void => {
        const success = sendMessage(inputValue, selectedRole);
        if (success) {
            setInputValue('');
        }
    }, [sendMessage, inputValue, selectedRole]);

    const handleRespondToInterrupt = useCallback((input: boolean | string | EvidenceInputPayload): void => {
        respondToInterrupt(input);
    }, [respondToInterrupt]);

    const handleClearSession = useCallback((): void => {
        if (window.confirm('确定要清除当前会话吗？所有消息将被清除。')) {
            clearSession();
        }
    }, [clearSession]);

    // 角色切换处理程序 (替换 useEffect 同步)
    const handleRoleChange = useCallback((newRole: UserRole) => {
        setSelectedRole(newRole);
        if (newRole === 'Prosecutor AI') setNewEvidenceSpeaker('原告律师');
        else if (newRole === 'Defense AI') setNewEvidenceSpeaker('被告律师');
    }, []);

    // 证据处理 (缓存)
    const deleteEvidence = useCallback((index: number, isFile: boolean): void => {
        if (window.confirm("确定要移除这项证据吗？")) {
            if (isFile) setFileEvidence(prev => prev.filter((_, i) => i !== index));
            else setTextEvidence(prev => prev.filter((_, i) => i !== index));
        }
    }, []);

    const handleTextEvidenceEdit = useCallback((index: number, value: string): void => {
        setTextEvidence(prev => {
            const newArr = [...prev];
            newArr[index] = { ...newArr[index], content: value };
            return newArr;
        });
    }, []);

    const handleAddTextEvidence = useCallback((evidence: TextEvidence): void => {
        setTextEvidence(prev => [...prev, evidence]);
    }, []);

    const handleAddFileEvidence = useCallback((evidence: FileEvidence): void => {
        setFileEvidence(prev => [...prev, evidence]);
    }, []);

    // --- 布局调整 ---
    type ResizeDirection = 'left' | 'right' | 'input';

    const startResizing = useCallback((direction: ResizeDirection) => (e: React.MouseEvent): void => {
        e.preventDefault();
        const startX = e.clientX;
        const startW = direction === 'left' ? leftWidth : rightWidth;

        const onMove = (ev: MouseEvent): void => {
            if (direction === 'left' || direction === 'right') {
                const d = ev.clientX - startX;
                if (direction === 'left') setLeftWidth(Math.max(250, Math.min(600, startW + d)));
                else setRightWidth(Math.max(250, Math.min(500, startW - d)));
            }
        };

        const onUp = (): void => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    }, [leftWidth, rightWidth]);

    // --- 为 LeftSidebar 缓存的 Props (性能优化) ---
    const leftLayoutConfig: LayoutConfig = useMemo(() => ({
        width: leftWidth,
        onStartResize: startResizing('left')
    }), [leftWidth, startResizing]);

    const caseDataConfig: CaseDataConfig = useMemo(() => ({
        context: caseContext,
        onChange: setCaseContext
    }), [caseContext]);

    const evidenceDataConfig: EvidenceDataConfig = useMemo(() => ({
        file: fileEvidence,
        text: textEvidence,
        filter: evidenceFilter as 'all' | '原告律师' | '被告律师',
        onFilterChange: setEvidenceFilter,
        onDelete: deleteEvidence,
        onOpen: windowActions.open,
        onTextEdit: handleTextEvidenceEdit
    }), [fileEvidence, textEvidence, evidenceFilter, deleteEvidence, windowActions.open, handleTextEvidenceEdit]);

    const newEvidenceInputConfig: NewEvidenceInputConfig = useMemo(() => ({
        value: newEvidenceInput,
        onChange: setNewEvidenceInput,
        speaker: newEvidenceSpeaker,
        onSpeakerChange: setNewEvidenceSpeaker,
        onAddText: handleAddTextEvidence,
        onAddFile: handleAddFileEvidence
    }), [newEvidenceInput, newEvidenceSpeaker, handleAddTextEvidence, handleAddFileEvidence]);

    const sessionInfoConfig: SessionInfoConfig = useMemo(() => ({
        isConnected,
        isTurnToSpeak,
        logs,
        selectedRole
    }), [isConnected, isTurnToSpeak, logs, selectedRole]);


    return (
        <div className="flex h-screen w-full bg-surface-container-low font-sans text-on-surface overflow-hidden relative selection:bg-primary-container selection:text-on-primary-container">

            {/* 窗口层 */}
            {windows.map(win => (
                <DraggableWindow
                    key={win.id}
                    win={win}
                    onClose={windowActions.close}
                    onFocus={windowActions.focus}
                    updatePosition={windowActions.updatePosition}
                    updateSize={windowActions.updateSize}
                />
            ))}

            {/* 左侧边栏 */}
            <LeftSidebar
                layout={leftLayoutConfig}
                caseData={caseDataConfig}
                evidenceData={evidenceDataConfig}
                newEvidenceInput={newEvidenceInputConfig}
                sessionInfo={sessionInfoConfig}
                caseInfo={{
                    case_id: DEFAULT_CASE_INFO.case_id,
                    court_name: DEFAULT_CASE_INFO.court_name,
                    defendant_name: DEFAULT_CASE_INFO.defendant_name,
                    crime: DEFAULT_CASE_INFO.crime
                }}
            />

            {/* 中间区 (聊天) */}
            <ChatArea
                messages={messages}
                roleFilter={roleFilter}
                onRoleFilterChange={setRoleFilter}
                currentPhase={currentPhase}
                currentSpeaker={currentSpeaker}
                sessionId={sessionId}
                isConnected={isConnected}
                inputValue={inputValue}
                onInputChange={setInputValue}
                onSendMessage={handleSendMessage}
                isTurnToSpeak={isTurnToSpeak}
                isLongFormMode={isLongFormMode}
                onExpandInput={() => setIsLongFormMode(true)}
                onCloseLongForm={() => setIsLongFormMode(false)}
                selectedRole={selectedRole}
                inputWindowState={inputWindow}
                onFocusInputWindow={inputWindowActions.focus}
                onUpdateInputWindowPos={inputWindowActions.updatePosition}
                onUpdateInputWindowSize={inputWindowActions.updateSize}
                // 新增 props
                interruptState={interruptState}
                evidenceList={evidenceList}
                onRespondToInterrupt={handleRespondToInterrupt}
                progress={progress}
            />

            {/* 右侧边栏 */}
            <RightSidebar
                width={rightWidth}
                onStartResize={startResizing('right')}
                selectedRole={selectedRole}
                onRoleChange={handleRoleChange}
                roleOptions={Object.keys(ROLE_MAPPINGS) as UserRole[]}
                isConnected={isConnected}
                isConnecting={isConnecting}
                isTurnToSpeak={isTurnToSpeak}
                currentPhase={currentPhase}
                activeNode={activeNode}
                progress={progress}
                onStartTrial={handleStartTrial}
                onNextStep={handleClearSession}
                lastInterruptReq={lastInterruptReq}
                onRetry={retry}
            />

        </div>
    );
}
