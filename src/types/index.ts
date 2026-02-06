/**
 * Mock Court - 核心类型定义
 * 
 * 此文件包含整个应用程序中使用的所有共享 TypeScript 接口和类型。
 * 已适配新的纯 WebSocket 后端架构。
 */

// =============================================================================
// 消息类型
// =============================================================================

/** 用于样式和显示的 UI 角色标识符 */
export type UIRole = 'system' | 'user' | 'prosecutor' | 'defense' | 'judge' | 'clerk';

/** 按钮尺寸变体 */
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'icon';

/** 按钮样式变体 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'success';

/** 聊天区域显示的消息 */
export interface Message {
    /** 消息的唯一标识符 */
    id: string | number;
    /** 用于样式的 UI 角色 (从后端角色映射) */
    role: UIRole;
    /** 发送者的显示名称 */
    name: string;
    /** 消息内容 (可能包含 markdown) */
    content: string;
    /** 此消息是否由当前用户发送 */
    isSelf?: boolean;
    /** 格式化后的时间戳字符串 (例如 "14:30") */
    timestamp: string;
    /** 关联的节点名称 (来自后端) */
    nodeName?: string;
}

// =============================================================================
// 证据类型
// =============================================================================

/** 证据项目类型 */
export type EvidenceType = 'file' | 'text' | 'image' | 'pdf';

/** 基础证据接口 */
interface BaseEvidence {
    /** 证据的所有者/发言人 (例如 "原告律师") */
    speaker: string;
}

/** 文本类证据 (引言、记录) */
export interface TextEvidence extends BaseEvidence {
    id?: string;
    name?: string;
    /** 证据的文本内容 */
    content: string;
}

/** 文件类证据 (文档、图像) */
export interface FileEvidence extends BaseEvidence {
    /** 文件名 */
    name: string;
    /** 文件类型 */
    type: EvidenceType;
    /** 用于预览的可选 URL (通过 URL.createObjectURL 创建) */
    url: string | null;
}

/** 任何证据项目的联合类型 */
export type Evidence = TextEvidence | FileEvidence;

/** 后端证据格式 */
export interface BackendEvidence {
    id: string;
    name: string;
    content: string;
    provider: 'prosecutor' | 'defendant';
}

// =============================================================================
// WebSocket 协议类型 (新后端适配)
// =============================================================================

/** 客户端 → 服务端消息类型 */
export type ClientMessageType = 'start_trial' | 'user_input' | 'ping';

/** 服务端 → 客户端消息类型 */
export type ServerMessageType =
    | 'session_created'
    | 'node_executed'
    | 'interrupt_request'
    | 'trial_completed'
    | 'error'
    | 'pong';

/** 中断输入类型 */
export type InterruptInputType = 'boolean' | 'string' | 'evidence';

/** 中断请求状态 */
export interface InterruptState {
    /** 是否正在等待用户输入 */
    isInterrupted: boolean;
    /** 中断节点名称 */
    nodeName: string | null;
    /** 期望的输入类型 */
    inputType: InterruptInputType | null;
    /** 显示给用户的提示 */
    prompt: string;
    /** 可选的选项列表 */
    options?: string[] | null;
    /** 额外元数据 */
    metadata?: Record<string, unknown>;
}

/** 案件信息 (必须与后端 src/state.py 的 case_info 模型匹配) */
export interface CaseInfo {
    // 案件本身信息
    abstract: string;

    // 控方信息
    prosecutor_title: string;
    prosecutor_name: string;
    statement_charge: string;
    crime: string;

    // 辩方信息
    defendant_name: string;
    defendant_former_name?: string | null;
    defendant_birthdate: string;
    defendant_birthplace: string;
    defendant_ethnicity: string;
    defendant_education: string;
    defendant_occupation: string;
    defendant_employer: string;
    defendant_residence: string;
    defendant_ID_number: string;
    defendant_legal_record: string;
    detention_date: string;
    indictment_date: string;
    attorney_name: string;

    // 审理法院信息
    court_name: string;
    judge_name: string;
    judge_name_2: string;
    clerk_name: string;
    case_id: string;
}

/** start_trial 请求载荷 */
export interface StartTrialPayload {
    case_info: CaseInfo;
    evidence_list: BackendEvidence[];
}

/** session_created 事件数据 */
export interface SessionCreatedData {
    message: string;
    thread_id: string;
}

/** node_executed 事件数据 */
export interface NodeExecutedData {
    node_name: string;
    state_delta: Record<string, unknown>;
    current_phase: string;
    progress: number;
    message_count: number;
    focus: string[];
    rounds: {
        pros_question_rounds: number;
        pros_evidence_rounds: number;
        pros_focus_rounds: number;
    };
    messages: Array<{
        type: 'human' | 'ai';
        content: string;
        name?: string;
    }>;
}

/** interrupt_request 事件数据 */
export interface InterruptRequestData {
    node_name: string;
    prompt: string;
    input_type: InterruptInputType;
    options?: string[] | null;
    metadata?: Record<string, unknown>;
}

/** user_input 请求载荷 */
export interface UserInputPayload {
    interrupt_node: string;
    input: boolean | string | EvidenceInputPayload;
}

/** 证据输入载荷 */
export interface EvidenceInputPayload {
    current_evidence: BackendEvidence | BackendEvidence[] | null;
    messages: string;
}

/** trial_completed 事件数据 */
export interface TrialCompletedData {
    final_state: Record<string, unknown>;
}

/** error 事件数据 */
export interface ErrorData {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}

/** WebSocket 消息包装 */
export interface WSMessage<T = unknown> {
    type: ServerMessageType | ClientMessageType;
    thread_id?: string;
    data: T;
}

// =============================================================================
// 会话类型
// =============================================================================

/** 可供选择的用户角色 */
export type UserRole = 'Prosecutor AI' | 'Defense AI' | 'Judge AI' | 'Observer';

/** 后端角色字符串 (中文) */
export type BackendRole = '原告律师' | '被告律师' | '法官' | null;

/** 庭审阶段 */
export type TrialPhase =
    | '准备阶段'
    | '开庭阶段'
    | '法庭调查'
    | '法庭辩论'
    | '宣判阶段'
    | '已结束';

/** 执行流可视化中的激活节点 */
export type ActiveNode =
    | 'standby'
    | 'prosecutor'
    | 'defendant'
    | 'defense'
    | 'judge'
    | 'clerk'
    | 'verdict';

/** 完整的会话状态对象 */
export interface SessionState {
    messages: Message[];
    isConnected: boolean;
    isConnecting: boolean;
    sessionId: string | null;
    threadId: string | null;
    currentPhase: TrialPhase | string;
    rounds: {
        pros_question_rounds: number;
        pros_evidence_rounds: number;
        pros_focus_rounds: number;
    };
    currentSpeaker: string;
    activeNode: ActiveNode;
    isTurnToSpeak: boolean;
    logs: string[];
    /** 中断状态 (新增) */
    interruptState: InterruptState;
    /** 进度百分比 0-100 (新增) */
    progress: number;
    /** 争议焦点列表 (新增) */
    focus: string[];
    /** 证据列表 (新增) */
    evidenceList: BackendEvidence[];
}

/** 会话操作接口 */
export interface SessionActions {
    connect: (
        selectedRole: UserRole,
        caseInfo: CaseInfo,
        evidenceList: BackendEvidence[]
    ) => Promise<void>;
    disconnect: () => Promise<void>;
    clearSession: () => Promise<void>;
    sendMessage: (content: string, selectedRole: UserRole) => boolean;
    respondToInterrupt: (input: boolean | string | EvidenceInputPayload) => void;
    addMessage: (role: UIRole, name: string, content: string, isSelf?: boolean, nodeName?: string) => void;
    addLog: (msg: string) => void;
}

/** useCourtSession hook 返回类型 */
export interface UseCourtSessionReturn {
    sessionState: SessionState;
    actions: SessionActions;
    constants: {
        ROLE_MAPPINGS: Record<UserRole, BackendRole>;
        BACKEND_TO_UI_ROLE: Record<string, UIRole>;
        NODE_TO_PHASE: Record<string, TrialPhase>;
    };
}

// =============================================================================
// 窗口类型
// =============================================================================

/** 可拖拽窗口状态 */
export interface WindowState {
    id: string | number;
    title?: string;
    content?: string;
    type?: EvidenceType | 'text';
    url?: string | null;
    x: number;
    y: number;
    w: number;
    h: number;
    zIndex: number;
}

/** 窗口管理操作 */
export interface WindowActions {
    open: (title: string, content: string, type?: string, url?: string | null) => void;
    close: (id: string | number) => void;
    focus: (id: string | number) => void;
    updatePosition: (id: string | number, x: number, y: number) => void;
    updateSize: (id: string | number, w: number, h: number) => void;
}

/** 输入窗口操作 (子集) */
export interface InputWindowActions {
    focus: () => void;
    updatePosition: (id: string | number, x: number, y: number) => void;
    updateSize: (id: string | number, w: number, h: number) => void;
}

/** useWindowManager hook 返回类型 */
export interface UseWindowManagerReturn {
    windows: WindowState[];
    windowActions: WindowActions;
    inputWindow: WindowState;
    inputWindowActions: InputWindowActions;
    nextZIndex: number;
}

// =============================================================================
// 组件 Props 类型 (用于 LeftSidebar 分组后的 props)
// =============================================================================

export interface LayoutConfig {
    width: number;
    onStartResize: (e: React.MouseEvent) => void;
}

export interface CaseDataConfig {
    context: string;
    onChange: (value: string) => void;
}

export interface EvidenceDataConfig {
    file: FileEvidence[];
    text: TextEvidence[];
    filter: 'all' | '原告律师' | '被告律师';
    onFilterChange: (filter: string) => void;
    onDelete: (index: number, isFile: boolean) => void;
    onOpen: (title: string, content: string, type?: string, url?: string | null) => void;
    onTextEdit: (index: number, value: string) => void;
}

export interface NewEvidenceInputConfig {
    value: string;
    onChange: (value: string) => void;
    speaker: string;
    onSpeakerChange: (speaker: string) => void;
    onAddText: (evidence: TextEvidence) => void;
    onAddFile: (evidence: FileEvidence) => void;
}

export interface SessionInfoConfig {
    isConnected: boolean;
    isTurnToSpeak: boolean;
    logs: string[];
    selectedRole: UserRole;
}
