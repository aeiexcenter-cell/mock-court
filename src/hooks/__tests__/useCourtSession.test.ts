import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { useCourtSession } from '../useCourtSession';
import { CourtClient } from '../../CourtClient';
import type { CaseInfo, BackendEvidence, SessionCreatedData, InterruptRequestData } from '../../types';

// Properly mock the module
vi.mock('../../CourtClient');

// Test case info - 必须包含所有必填字段
const mockCaseInfo: CaseInfo = {
    abstract: '测试案件摘要',
    prosecutor_title: '测试检察院',
    prosecutor_name: '测试检察官',
    statement_charge: '测试起诉书',
    crime: '测试罪名',
    defendant_name: '测试被告',
    defendant_birthdate: '2000年1月1日',
    defendant_birthplace: '测试地点',
    defendant_ethnicity: '汉族',
    defendant_education: '大学',
    defendant_occupation: '无业',
    defendant_employer: '无',
    defendant_residence: '测试地址',
    defendant_ID_number: '000000000000000000',
    defendant_legal_record: '无',
    detention_date: '2024年1月1日',
    indictment_date: '2024年2月1日',
    attorney_name: '测试律师',
    court_name: '测试法庭',
    judge_name: '测试法官',
    judge_name_2: '测试陪审员',
    clerk_name: '测试书记员',
    case_id: 'TEST-001'
};

const mockEvidenceList: BackendEvidence[] = [];

describe('useCourtSession Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Define default mock implementation for new WebSocket-only architecture
        vi.mocked(CourtClient).mockImplementation(() => {
            return {
                connect: vi.fn().mockResolvedValue(undefined),
                startTrial: vi.fn(),
                sendUserInput: vi.fn(),
                disconnect: vi.fn(),
                ping: vi.fn(),
                updateCallbacks: vi.fn(),
                threadId: null,
                isConnected: false,
            } as unknown as CourtClient;
        });
    });

    it('should initialize with disconnected state', () => {
        const { result } = renderHook(() => useCourtSession());
        const { sessionState } = result.current;

        expect(sessionState.isConnected).toBe(false);
        expect(sessionState.isConnecting).toBe(false);
        expect(sessionState.sessionId).toBeNull();
        expect(sessionState.threadId).toBeNull();
        expect(sessionState.messages.length).toBeGreaterThan(0);
        expect(sessionState.messages[0].role).toBe('system');
        expect(sessionState.interruptState.isInterrupted).toBe(false);
    });

    it('should have initial interrupt state set correctly', () => {
        const { result } = renderHook(() => useCourtSession());
        const { sessionState } = result.current;

        expect(sessionState.interruptState).toEqual({
            isInterrupted: false,
            nodeName: null,
            inputType: null,
            prompt: '',
            options: null,
            metadata: undefined
        });
    });

    it('should connect and handle session created event', async () => {
        const { result } = renderHook(() => useCourtSession());
        const { actions } = result.current;

        await act(async () => {
            await actions.connect('Prosecutor AI', mockCaseInfo, mockEvidenceList);
        });

        // Get the mocked instance
        const MockCourtClient = vi.mocked(CourtClient);
        const clientInstance = MockCourtClient.mock.instances[0];

        const connectMock = clientInstance.connect as unknown as Mock;
        expect(connectMock).toHaveBeenCalled();

        // Capture callbacks
        const callbacks = connectMock.mock.calls[0][0];

        // Simulate session created
        const sessionData: SessionCreatedData = {
            message: '会话已创建',
            thread_id: 'test-thread-123'
        };

        act(() => {
            callbacks.onSessionCreated?.(sessionData);
        });

        expect(result.current.sessionState.isConnected).toBe(true);
        expect(result.current.sessionState.threadId).toBe('test-thread-123');
    });

    it('should handle interrupt request and update state', async () => {
        const { result } = renderHook(() => useCourtSession());
        const { actions } = result.current;

        await act(async () => {
            await actions.connect('Prosecutor AI', mockCaseInfo, mockEvidenceList);
        });

        const MockCourtClient = vi.mocked(CourtClient);
        const clientInstance = MockCourtClient.mock.instances[0];
        const connectMock = clientInstance.connect as unknown as Mock;
        const callbacks = connectMock.mock.calls[0][0];

        // Simulate connection
        act(() => {
            callbacks.onSessionCreated?.({ message: '', thread_id: 'test-123' });
        });

        // Simulate interrupt request
        const interruptData: InterruptRequestData = {
            node_name: 'defense_objection',
            prompt: '被告人是否有异议？',
            input_type: 'boolean'
        };

        act(() => {
            callbacks.onInterruptRequest?.(interruptData);
        });

        expect(result.current.sessionState.interruptState.isInterrupted).toBe(true);
        expect(result.current.sessionState.interruptState.inputType).toBe('boolean');
        expect(result.current.sessionState.interruptState.prompt).toBe('被告人是否有异议？');
        expect(result.current.sessionState.isTurnToSpeak).toBe(true);
    });

    it('should respond to interrupt and clear state', async () => {
        const { result } = renderHook(() => useCourtSession());
        const { actions } = result.current;

        await act(async () => {
            await actions.connect('Prosecutor AI', mockCaseInfo, mockEvidenceList);
        });

        const MockCourtClient = vi.mocked(CourtClient);
        const clientInstance = MockCourtClient.mock.instances[0];
        const connectMock = clientInstance.connect as unknown as Mock;
        const sendUserInputMock = clientInstance.sendUserInput as unknown as Mock;
        const callbacks = connectMock.mock.calls[0][0];

        // Simulate connection and interrupt
        act(() => {
            callbacks.onSessionCreated?.({ message: '', thread_id: 'test-123' });
        });

        act(() => {
            callbacks.onInterruptRequest?.({
                node_name: 'defense_objection',
                prompt: '是否有异议？',
                input_type: 'boolean'
            });
        });

        // Respond to interrupt
        act(() => {
            result.current.actions.respondToInterrupt(false);
        });

        expect(sendUserInputMock).toHaveBeenCalledWith('defense_objection', false);
        expect(result.current.sessionState.interruptState.isInterrupted).toBe(false);
        expect(result.current.sessionState.isTurnToSpeak).toBe(false);
    });

    it('should handle errors gracefully', async () => {
        const { result } = renderHook(() => useCourtSession());
        const { actions } = result.current;

        await act(async () => {
            await actions.connect('Observer', mockCaseInfo, mockEvidenceList);
        });

        const MockCourtClient = vi.mocked(CourtClient);
        const clientInstance = MockCourtClient.mock.instances[0];
        const connectMock = clientInstance.connect as unknown as Mock;
        const callbacks = connectMock.mock.calls[0][0];

        // Simulate Connection Success
        act(() => {
            callbacks.onSessionCreated?.({ message: '', thread_id: 'test-123' });
        });
        expect(result.current.sessionState.isConnected).toBe(true);

        // Simulate Error
        act(() => {
            callbacks.onError?.({ code: 'WEBSOCKET_ERROR', message: 'Connection failed' });
        });

        // Assert Disconnected
        expect(result.current.sessionState.isConnected).toBe(false);
        expect(result.current.sessionState.activeNode).toBe('standby');

        // Verify error log
        const logs = result.current.sessionState.logs;
        expect(logs.some(l => l.includes('错误'))).toBe(true);
    });

    it('should clear session properly', async () => {
        const { result } = renderHook(() => useCourtSession());

        // Add a message first
        act(() => {
            result.current.actions.addMessage('judge', '法官', '测试消息');
        });

        expect(result.current.sessionState.messages.length).toBeGreaterThan(1);

        // Clear session
        await act(async () => {
            await result.current.actions.clearSession();
        });

        // Should be reset
        expect(result.current.sessionState.messages.length).toBe(1); // Initial message
        expect(result.current.sessionState.progress).toBe(0);
        expect(result.current.sessionState.interruptState.isInterrupted).toBe(false);
    });
});
