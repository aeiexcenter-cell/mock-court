/**
 * CourtClient - 纯 WebSocket 客户端
 * 
 * 适配新的 LangGraph 后端架构，使用事件驱动的 WebSocket 通信。
 * 
 * Security: 包含载荷验证和安全日志处理
 */
import type {
    CaseInfo,
    BackendEvidence,
    StartTrialPayload,
    UserInputPayload,
    SessionCreatedData,
    NodeExecutedData,
    InterruptRequestData,
    TrialCompletedData,
    ErrorData,
    EvidenceInputPayload,
    WSMessage,
    ServerMessageType
} from './types';

/** 开发环境标识 */
const IS_DEV = import.meta.env.DEV;

/**
 * 安全日志函数 - 仅在开发环境输出
 */
function devLog(...args: unknown[]): void {
    if (IS_DEV) {
        console.log(...args);
    }
}

function devWarn(...args: unknown[]): void {
    if (IS_DEV) {
        console.warn(...args);
    }
}

/**
 * 类型守卫: 验证 WebSocket 消息结构
 * 
 * @param data - 需要验证的未知数据
 * @returns 是否为有效的 WSMessage 结构
 */
function isValidWSMessage(data: unknown): data is WSMessage {
    if (typeof data !== 'object' || data === null) {
        return false;
    }

    const obj = data as Record<string, unknown>;

    // 必须有 type 字段且为字符串
    if (typeof obj.type !== 'string') {
        return false;
    }

    // 验证 type 是否为已知的服务端消息类型
    const validTypes: ServerMessageType[] = [
        'session_created',
        'node_executed',
        'interrupt_request',
        'trial_completed',
        'error',
        'pong'
    ];

    return validTypes.includes(obj.type as ServerMessageType);
}

/**
 * 类型守卫: 验证 SessionCreatedData 结构
 */
function isSessionCreatedData(data: unknown): data is SessionCreatedData {
    if (typeof data !== 'object' || data === null) return false;
    const obj = data as Record<string, unknown>;
    return typeof obj.thread_id === 'string';
}

/**
 * 类型守卫: 验证 NodeExecutedData 结构
 */
function isNodeExecutedData(data: unknown): data is NodeExecutedData {
    if (typeof data !== 'object' || data === null) return false;
    const obj = data as Record<string, unknown>;
    return typeof obj.node_name === 'string' && typeof obj.progress === 'number';
}

/**
 * 类型守卫: 验证 InterruptRequestData 结构
 */
function isInterruptRequestData(data: unknown): data is InterruptRequestData {
    if (typeof data !== 'object' || data === null) return false;
    const obj = data as Record<string, unknown>;
    return typeof obj.node_name === 'string' && typeof obj.input_type === 'string';
}

/**
 * 类型守卫: 验证 ErrorData 结构
 */
function isErrorData(data: unknown): data is ErrorData {
    if (typeof data !== 'object' || data === null) return false;
    const obj = data as Record<string, unknown>;
    return typeof obj.code === 'string' && typeof obj.message === 'string';
}

/** WebSocket 事件回调接口 */
export interface CourtClientCallbacks {
    /** WebSocket 连接打开 */
    onOpen?: () => void;
    /** 会话创建成功 */
    onSessionCreated?: (data: SessionCreatedData) => void;
    /** 节点执行完成 */
    onNodeExecuted?: (data: NodeExecutedData) => void;
    /** 需要用户输入 */
    onInterruptRequest?: (data: InterruptRequestData) => void;
    /** 庭审完成 */
    onTrialCompleted?: (data: TrialCompletedData) => void;
    /** 错误发生 */
    onError?: (data: ErrorData) => void;
    /** 连接关闭 */
    onClose?: () => void;
    /** Pong 响应 */
    onPong?: () => void;
}

/**
 * 纯 WebSocket 法庭客户端
 * 
 * 使用方式:
 * 1. 创建实例
 * 2. 调用 connect() 建立 WebSocket 连接
 * 3. 调用 startTrial() 开始庭审
 * 4. 通过回调接收事件
 * 5. 调用 sendUserInput() 响应中断
 */
export class CourtClient {
    private wsUrl: string;
    private ws: WebSocket | null = null;
    private callbacks: CourtClientCallbacks = {};
    private pingInterval: ReturnType<typeof setInterval> | null = null;

    /** 当前线程 ID */
    public threadId: string | null = null;

    /** 连接状态 */
    public isConnected: boolean = false;

    constructor(baseUrl: string = 'localhost:8000') {
        // 确保 URL 格式正确
        const cleanUrl = baseUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
        this.wsUrl = `ws://${cleanUrl}/ws/trial`;
    }

    /**
     * 建立 WebSocket 连接
     */
    connect(callbacks: CourtClientCallbacks = {}): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                devWarn('WebSocket already connected');
                resolve();
                return;
            }

            this.callbacks = callbacks;

            try {
                this.ws = new WebSocket(this.wsUrl);
            } catch (error) {
                reject(error);
                return;
            }

            this.ws.onopen = () => {
                devLog('WebSocket: 连接已建立');
                this.isConnected = true;
                this.startPingInterval();
                this.callbacks.onOpen?.();
                resolve();
            };

            this.ws.onmessage = (event: MessageEvent) => {
                this.handleMessage(event);
            };

            this.ws.onclose = () => {
                devLog('WebSocket: 连接已关闭');
                this.isConnected = false;
                this.threadId = null;
                this.stopPingInterval();
                this.callbacks.onClose?.();
            };

            this.ws.onerror = (error: Event) => {
                console.error('WebSocket 错误'); // 保留错误日志但不泄露细节
                this.isConnected = false;
                this.callbacks.onError?.({
                    code: 'WEBSOCKET_ERROR',
                    message: 'WebSocket connection error'
                });
                reject(error);
            };
        });
    }

    /**
     * 处理接收到的消息 - 带载荷验证
     */
    private handleMessage(event: MessageEvent): void {
        let parsed: unknown;

        try {
            parsed = JSON.parse(event.data);
        } catch (e) {
            console.error('WebSocket 消息解析错误');
            return;
        }

        // 验证消息结构
        if (!isValidWSMessage(parsed)) {
            devWarn('收到无效的 WebSocket 消息结构');
            return;
        }

        const message = parsed;
        devLog('WebSocket 收到消息:', message.type);

        switch (message.type) {
            case 'session_created':
                if (isSessionCreatedData(message.data)) {
                    this.threadId = message.data.thread_id;
                    this.callbacks.onSessionCreated?.(message.data);
                } else {
                    devWarn('session_created 数据结构无效');
                }
                break;

            case 'node_executed':
                if (isNodeExecutedData(message.data)) {
                    this.callbacks.onNodeExecuted?.(message.data);
                } else {
                    devWarn('node_executed 数据结构无效');
                }
                break;

            case 'interrupt_request':
                if (isInterruptRequestData(message.data)) {
                    this.callbacks.onInterruptRequest?.(message.data);
                } else {
                    devWarn('interrupt_request 数据结构无效');
                }
                break;

            case 'trial_completed':
                // TrialCompletedData 结构较松散，直接传递
                this.callbacks.onTrialCompleted?.(message.data as TrialCompletedData);
                break;

            case 'error':
                if (isErrorData(message.data)) {
                    this.callbacks.onError?.(message.data);
                } else {
                    devWarn('error 数据结构无效');
                }
                break;

            case 'pong':
                this.callbacks.onPong?.();
                break;

            default:
                devWarn('未知消息类型:', message.type);
        }
    }

    /**
     * 发送消息到服务器
     */
    private send(message: Record<string, unknown>): void {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new Error('WebSocket 未连接');
        }
        this.ws.send(JSON.stringify(message));
    }

    /**
     * 开始庭审
     * 
     * @param caseInfo 案件信息
     * @param evidenceList 证据列表
     */
    startTrial(caseInfo: CaseInfo, evidenceList: BackendEvidence[]): void {
        const payload: StartTrialPayload = {
            case_info: caseInfo,
            evidence_list: evidenceList
        };

        this.send({
            type: 'start_trial',
            data: payload
        });

        devLog('已发送 start_trial 请求');
    }

    /**
     * 发送用户输入响应中断
     * 
     * @param interruptNode 中断节点名称
     * @param input 用户输入 (布尔值、字符串或证据对象)
     */
    sendUserInput(interruptNode: string, input: boolean | string | EvidenceInputPayload): void {
        if (!this.threadId) {
            throw new Error('没有活动的会话线程');
        }

        const payload: UserInputPayload = {
            interrupt_node: interruptNode,
            input: input
        };

        this.send({
            type: 'user_input',
            thread_id: this.threadId,
            data: payload
        });

        devLog('已发送 user_input 响应:', interruptNode);
    }

    /**
     * 发送 Ping 保持连接
     */
    ping(): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.send({ type: 'ping' });
        }
    }

    /**
     * 启动心跳定时器
     */
    private startPingInterval(): void {
        this.stopPingInterval();
        // 每 30 秒发送一次 ping
        this.pingInterval = setInterval(() => {
            this.ping();
        }, 30000);
    }

    /**
     * 停止心跳定时器
     */
    private stopPingInterval(): void {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
    }

    /**
     * 断开连接
     */
    disconnect(): void {
        this.stopPingInterval();
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.isConnected = false;
        this.threadId = null;
    }

    /**
     * 更新回调函数
     */
    updateCallbacks(callbacks: Partial<CourtClientCallbacks>): void {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }
}

// 默认导出单例工厂
let clientInstance: CourtClient | null = null;

export function getCourtClient(baseUrl?: string): CourtClient {
    if (!clientInstance) {
        clientInstance = new CourtClient(baseUrl);
    }
    return clientInstance;
}

export function resetCourtClient(): void {
    if (clientInstance) {
        clientInstance.disconnect();
        clientInstance = null;
    }
}
