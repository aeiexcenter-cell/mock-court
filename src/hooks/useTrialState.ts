/**
 * useTrialState - 庭审状态管理 Hook
 * 
 * 使用 useReducer 合并状态更新，避免多个 setState 导致的性能问题。
 * 单一职责：管理庭审的核心数据状态。
 */
import { useReducer, useCallback, useRef } from 'react';
import type {
    Message,
    UIRole,
    ActiveNode,
    InterruptState,
    BackendEvidence,
    TrialPhase
} from '../types';

// =============================================================================
// 常量
// =============================================================================

/** 后端节点名称到庭审阶段的映射 */
export const NODE_TO_PHASE: Record<string, TrialPhase> = {
    'clerk_rules': '开庭阶段',
    'judge_open': '开庭阶段',
    'judge_check': '开庭阶段',
    'right_notify': '开庭阶段',
    'pros_indictment': '开庭阶段',
    'defense_defense_object_control': '开庭阶段',
    'defense_objection': '开庭阶段',
    'pros_question': '法庭调查',
    'defense_reply': '法庭调查',
    'defense_question_control': '法庭调查',
    'defense_question': '法庭调查',
    'pros_summary': '法庭调查',
    'defense_summary': '法庭调查',
    'judge_start_evidence': '法庭调查',
    'pros_evidence_decision': '法庭调查',
    'pros_show_evidence': '法庭调查',
    'defense_cross': '法庭调查',
    'judge_confirm': '法庭调查',
    'defense_evidence_control': '法庭调查',
    'defense_show_evidence': '法庭调查',
    'pros_cross': '法庭调查',
    'judge_start_debate': '法庭辩论',
    'pros_statement': '法庭辩论',
    'defense_self_statement': '法庭辩论',
    'defense_statement': '法庭辩论',
    'judge_summary': '法庭辩论',
    'focus': '法庭辩论',
    'pros_focus': '法庭辩论',
    'defense_focus': '法庭辩论',
    'pros_sumup': '法庭辩论',
    'defense_sumup': '法庭辩论',
    'defense_final_statement': '法庭辩论',
    'judge_verdict': '宣判阶段'
};

const INITIAL_MESSAGES: Message[] = [
    { id: 'sys_init', role: 'system', name: 'System', content: '系统已就绪。请配置案件信息并开始庭审。', timestamp: '00:00' }
];

const INITIAL_INTERRUPT_STATE: InterruptState = {
    isInterrupted: false,
    nodeName: null,
    inputType: null,
    prompt: '',
    options: null,
    metadata: undefined
};

const INITIAL_ROUNDS = {
    pros_question_rounds: 0,
    pros_evidence_rounds: 0,
    pros_focus_rounds: 0
};

// =============================================================================
// State & Action Types
// =============================================================================

export interface TrialState {
    // 消息
    messages: Message[];
    // 连接状态
    isConnected: boolean;
    isConnecting: boolean;
    sessionId: string | null;
    threadId: string | null;
    // 庭审进程
    currentPhase: TrialPhase | string;
    rounds: typeof INITIAL_ROUNDS;
    currentSpeaker: string;
    activeNode: ActiveNode;
    isTurnToSpeak: boolean;
    // 中断
    interruptState: InterruptState;
    // 进度
    progress: number;
    focus: string[];
    evidenceList: BackendEvidence[];
    // 日志
    logs: string[];
    // 最近一次中断请求（用于重试）
    lastInterruptReq: InterruptState | null;
}

type TrialAction =
    | { type: 'ADD_MESSAGE'; payload: Message }
    | { type: 'ADD_LOG'; payload: string }
    | { type: 'SET_CONNECTING'; payload: boolean }
    | { type: 'SESSION_CREATED'; payload: { sessionId: string; threadId: string } }
    | {
        type: 'NODE_EXECUTED'; payload: {
            nodeName: string;
            progress: number;
            phase?: TrialPhase | string;
            focus?: string[];
            rounds?: typeof INITIAL_ROUNDS;
            activeNode: ActiveNode;
        }
    }
    | { type: 'INTERRUPT_REQUEST'; payload: InterruptState }
    | { type: 'RESTORE_INTERRUPT'; payload: InterruptState }
    | { type: 'CLEAR_INTERRUPT' }
    | { type: 'TRIAL_COMPLETED' }
    | { type: 'CONNECTION_ERROR' }
    | { type: 'DISCONNECTED' }
    | { type: 'SET_EVIDENCE_LIST'; payload: BackendEvidence[] }
    | { type: 'RESET' };

// =============================================================================
// Reducer
// =============================================================================

const initialState: TrialState = {
    messages: INITIAL_MESSAGES,
    isConnected: false,
    isConnecting: false,
    sessionId: null,
    threadId: null,
    currentPhase: '准备阶段',
    rounds: INITIAL_ROUNDS,
    currentSpeaker: '',
    activeNode: 'standby',
    isTurnToSpeak: false,
    interruptState: INITIAL_INTERRUPT_STATE,
    progress: 0,
    focus: [],
    evidenceList: [],
    logs: [],
    lastInterruptReq: null
};

function trialReducer(state: TrialState, action: TrialAction): TrialState {
    switch (action.type) {
        case 'ADD_MESSAGE':
            return {
                ...state,
                messages: [...state.messages, action.payload]
            };

        case 'ADD_LOG':
            return {
                ...state,
                logs: [`[${new Date().toLocaleTimeString('en-GB')}] ${action.payload}`, ...state.logs]
            };

        case 'SET_CONNECTING':
            return {
                ...state,
                isConnecting: action.payload
            };

        case 'SESSION_CREATED':
            return {
                ...state,
                isConnected: true,
                isConnecting: false,
                sessionId: action.payload.sessionId,
                threadId: action.payload.threadId,
                activeNode: 'judge'
            };

        case 'NODE_EXECUTED':
            // 单次更新合并所有节点执行相关状态
            return {
                ...state,
                progress: action.payload.progress,
                currentPhase: action.payload.phase || state.currentPhase,
                focus: action.payload.focus || state.focus,
                rounds: action.payload.rounds || state.rounds,
                activeNode: action.payload.activeNode,
                currentSpeaker: action.payload.nodeName,
                isTurnToSpeak: false
            };

        case 'INTERRUPT_REQUEST':
            return {
                ...state,
                interruptState: action.payload,
                lastInterruptReq: action.payload, // 保存最新请求用于重试
                isTurnToSpeak: true,
                activeNode: nodeNameToActiveNode(action.payload.nodeName || '')
            };

        case 'RESTORE_INTERRUPT':
            return {
                ...state,
                interruptState: action.payload,
                isTurnToSpeak: true,
                activeNode: nodeNameToActiveNode(action.payload.nodeName || '')
            };

        case 'CLEAR_INTERRUPT':
            return {
                ...state,
                interruptState: INITIAL_INTERRUPT_STATE,
                isTurnToSpeak: false
            };

        case 'TRIAL_COMPLETED':
            return {
                ...state,
                currentPhase: '已结束',
                activeNode: 'verdict',
                progress: 100,
                isTurnToSpeak: false,
                interruptState: INITIAL_INTERRUPT_STATE
            };

        case 'CONNECTION_ERROR':
            return {
                ...state,
                isConnected: false,
                isConnecting: false,
                activeNode: 'standby'
            };

        case 'DISCONNECTED':
            return {
                ...state,
                isConnected: false,
                sessionId: null,
                threadId: null,
                activeNode: 'standby'
            };

        case 'SET_EVIDENCE_LIST':
            return {
                ...state,
                evidenceList: action.payload
            };

        case 'RESET':
            return initialState;

        default:
            return state;
    }
}

// =============================================================================
// Helper Functions
// =============================================================================

function nodeNameToActiveNode(nodeName: string): ActiveNode {
    if (nodeName.includes('pros') || nodeName.includes('prosecutor')) return 'prosecutor';
    if (nodeName.includes('defense') || nodeName.includes('defendant')) return 'defense';
    if (nodeName.includes('judge') || nodeName.includes('focus') || nodeName.includes('verdict')) return 'judge';
    if (nodeName.includes('clerk')) return 'clerk';
    return 'standby';
}

/**
 * 根据发言人名称推断 UI 角色
 */
export function inferUIRole(speakerName?: string): UIRole {
    if (!speakerName) return 'system';

    if (speakerName.startsWith('书记员')) return 'clerk';
    if (speakerName.startsWith('审判长') || speakerName.startsWith('法官')) return 'judge';
    if (speakerName.startsWith('公诉人') || speakerName.startsWith('检察员')) return 'prosecutor';
    if (speakerName.startsWith('被告人') || speakerName.startsWith('被告') ||
        speakerName.startsWith('辩护人') || speakerName.startsWith('辩护代理人') ||
        speakerName.startsWith('辩护')) return 'defense';

    return 'system';
}

/**
 * 从消息内容中提取发言人名称
 */
export function extractSpeakerName(content: string, msgName?: string): string {
    if (msgName) return msgName;

    const patterns = [
        /^(审判长[^：:]*)[：:]/,
        /^(公诉人[^：:]*)[：:]/,
        /^(被告人[^：:]*)[：:]/,
        /^(辩护人[^：:]*)[：:]/,
        /^(书记员[^：:]*)[：:]/,
    ];

    for (const pattern of patterns) {
        const match = content.match(pattern);
        if (match) return match[1];
    }

    return 'System';
}

// =============================================================================
// Hook
// =============================================================================

export interface UseTrialStateReturn {
    state: TrialState;
    dispatch: React.Dispatch<TrialAction>;
    // 便捷方法
    addMessage: (role: UIRole, name: string, content: string, isSelf?: boolean, nodeName?: string) => void;
    addLog: (msg: string) => void;
    processedMessageCountRef: React.MutableRefObject<number>;
    processedContentSetRef: React.MutableRefObject<Set<string>>;
}

export function useTrialState(): UseTrialStateReturn {
    const [state, dispatch] = useReducer(trialReducer, initialState);
    const processedMessageCountRef = useRef<number>(0);
    const processedContentSetRef = useRef<Set<string>>(new Set());

    const addMessage = useCallback((
        role: UIRole,
        name: string,
        content: string,
        isSelf: boolean = false,
        nodeName?: string
    ): void => {
        dispatch({
            type: 'ADD_MESSAGE',
            payload: {
                id: Date.now() + Math.random(),
                role,
                name,
                content,
                isSelf,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                nodeName
            }
        });
    }, []);

    const addLog = useCallback((msg: string): void => {
        dispatch({ type: 'ADD_LOG', payload: msg });
    }, []);

    return {
        state,
        dispatch,
        addMessage,
        addLog,
        processedMessageCountRef,
        processedContentSetRef
    };
}

// 导出类型和常量
export type { TrialAction };
export { nodeNameToActiveNode, INITIAL_INTERRUPT_STATE, INITIAL_ROUNDS };
