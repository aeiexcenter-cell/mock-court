/**
 * useWebSocket - WebSocket 连接管理 Hook
 * 
 * 单一职责：管理 WebSocket 连接生命周期和事件绑定。
 * 不包含业务逻辑，仅提供连接/断开和事件回调绑定。
 */
import { useRef, useCallback } from 'react';
import { CourtClient, type CourtClientCallbacks } from '../CourtClient';
import type {
    CaseInfo,
    BackendEvidence,
    EvidenceInputPayload
} from '../types';

// =============================================================================
// Types
// =============================================================================

export interface UseWebSocketReturn {
    /** WebSocket 客户端引用 */
    clientRef: React.MutableRefObject<CourtClient>;
    /** 建立连接并开始庭审 */
    connect: (
        callbacks: CourtClientCallbacks,
        caseInfo: CaseInfo,
        evidenceList: BackendEvidence[]
    ) => Promise<void>;
    /** 断开连接 */
    disconnect: () => void;
    /** 发送用户输入 */
    sendUserInput: (nodeName: string, input: boolean | string | EvidenceInputPayload) => void;
    /** 获取连接状态 */
    isConnected: () => boolean;
    /** 获取线程 ID */
    getThreadId: () => string | null;
}

// =============================================================================
// Hook
// =============================================================================

export function useWebSocket(): UseWebSocketReturn {
    const clientRef = useRef<CourtClient>(new CourtClient());

    /**
     * 建立 WebSocket 连接并开始庭审
     */
    const connect = useCallback(async (
        callbacks: CourtClientCallbacks,
        caseInfo: CaseInfo,
        evidenceList: BackendEvidence[]
    ): Promise<void> => {
        const client = clientRef.current;

        // 如果已连接，先断开
        if (client.isConnected) {
            client.disconnect();
        }

        // 建立连接
        await client.connect(callbacks);

        // 发送开始庭审请求
        client.startTrial(caseInfo, evidenceList);
    }, []);

    /**
     * 断开连接
     */
    const disconnect = useCallback((): void => {
        clientRef.current.disconnect();
    }, []);

    /**
     * 发送用户输入响应中断
     */
    const sendUserInput = useCallback((
        nodeName: string,
        input: boolean | string | EvidenceInputPayload
    ): void => {
        clientRef.current.sendUserInput(nodeName, input);
    }, []);

    /**
     * 获取连接状态
     */
    const isConnected = useCallback((): boolean => {
        return clientRef.current.isConnected;
    }, []);

    /**
     * 获取线程 ID
     */
    const getThreadId = useCallback((): string | null => {
        return clientRef.current.threadId;
    }, []);

    return {
        clientRef,
        connect,
        disconnect,
        sendUserInput,
        isConnected,
        getThreadId
    };
}
