import React, { useState, useMemo } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import DetailedInputWindow from '../../components/DetailedInputWindow';
import EvidenceWindow from '../../components/EvidenceWindow';
import type {
    Message,
    UserRole,
    WindowState,
    InterruptState,
    BackendEvidence,
    EvidenceInputPayload,
    UIRole
} from '../../types';

// 支持的所有角色
const ALL_ROLES: UIRole[] = ['judge', 'prosecutor', 'defense', 'clerk', 'system'];

// 角色显示名称映射
const ROLE_LABELS: Record<UIRole, string> = {
    judge: '法官',
    prosecutor: '公诉人',
    defense: '辩护方',
    clerk: '书记员',
    system: '系统',
    user: '用户'
};

export interface ChatAreaProps {
    // 消息
    messages: Message[];
    roleFilter: string;
    onRoleFilterChange: (role: string) => void;
    // 会话信息
    currentPhase: string;
    currentSpeaker: string;
    sessionId: string | null;
    isConnected: boolean;
    // 输入处理
    inputValue: string;
    onInputChange: (value: string) => void;
    onSendMessage: () => void;
    isTurnToSpeak: boolean;
    // 长文本模式
    isLongFormMode: boolean;
    onExpandInput: () => void;
    onCloseLongForm: () => void;
    selectedRole: UserRole;
    // 输入窗口
    inputWindowState: WindowState;
    onFocusInputWindow: () => void;
    onUpdateInputWindowPos: (id: string | number, x: number, y: number) => void;
    onUpdateInputWindowSize: (id: string | number, w: number, h: number) => void;
    // 证据窗口
    evidenceWindowState?: WindowState;
    onFocusEvidenceWindow?: () => void;
    onUpdateEvidenceWindowPos?: (id: string | number, x: number, y: number) => void;
    onUpdateEvidenceWindowSize?: (id: string | number, w: number, h: number) => void;
    // 新增：中断状态相关
    interruptState?: InterruptState;
    evidenceList?: BackendEvidence[];
    onRespondToInterrupt?: (input: boolean | string | EvidenceInputPayload) => void;
    // 新增：进度
    progress?: number;
}

/**
 * ChatArea - 包含页眉、消息列表和输入框的主聊天区域。
 * 组合了 MessageList 和 MessageInput 组件。
 * 
 * 适配新的 WebSocket 后端架构，支持中断状态和多态输入。
 * 新增：多选角色过滤器
 */
const ChatArea: React.FC<ChatAreaProps> = ({
    // 消息
    messages,
    // 会话信息
    currentPhase,
    currentSpeaker,
    sessionId,
    isConnected,
    // 输入处理
    inputValue,
    onInputChange,
    onSendMessage,
    isTurnToSpeak,
    // 长文本模式
    isLongFormMode,
    onExpandInput,
    onCloseLongForm,
    selectedRole,
    // 输入窗口
    inputWindowState,
    onFocusInputWindow,
    onUpdateInputWindowPos,
    onUpdateInputWindowSize,
    // 证据窗口
    evidenceWindowState,
    onFocusEvidenceWindow,
    onUpdateEvidenceWindowPos,
    onUpdateEvidenceWindowSize,
    // 新增
    interruptState,
    evidenceList = [],
    onRespondToInterrupt,
}) => {
    // 多选角色过滤状态
    const [visibleRoles, setVisibleRoles] = useState<UIRole[]>(ALL_ROLES);

    // 内部证据窗口状态（当外部未提供时使用）
    const [internalEvidenceWinState, setInternalEvidenceWinState] = useState<WindowState>({
        id: 'evidence-window',
        x: Math.max(100, window.innerWidth / 2 - 300),
        y: Math.max(80, window.innerHeight / 2 - 250),
        w: 600,
        h: 500,
        zIndex: 100
    });

    // 使用外部状态或内部状态
    const effectiveEvidenceWinState = evidenceWindowState || internalEvidenceWinState;

    const handleUpdateEvidencePos = (id: string | number, x: number, y: number) => {
        if (onUpdateEvidenceWindowPos) {
            onUpdateEvidenceWindowPos(id, x, y);
        } else {
            setInternalEvidenceWinState(prev => ({ ...prev, x, y }));
        }
    };

    const handleUpdateEvidenceSize = (id: string | number, w: number, h: number) => {
        if (onUpdateEvidenceWindowSize) {
            onUpdateEvidenceWindowSize(id, w, h);
        } else {
            setInternalEvidenceWinState(prev => ({ ...prev, w, h }));
        }
    };

    const handleFocusEvidence = () => {
        if (onFocusEvidenceWindow) {
            onFocusEvidenceWindow();
        } else {
            setInternalEvidenceWinState(prev => ({ ...prev, zIndex: prev.zIndex + 1 }));
        }
    };

    // 判断是否显示证据窗口
    const showEvidenceWindow = interruptState?.isInterrupted && interruptState?.inputType === 'evidence';

    // 切换角色可见性
    const toggleRole = (role: UIRole) => {
        setVisibleRoles(prev =>
            prev.includes(role)
                ? prev.filter(r => r !== role)
                : [...prev, role]
        );
    };

    // 过滤消息
    const filteredMessages = useMemo(() => {
        return messages.filter(m => visibleRoles.includes(m.role));
    }, [messages, visibleRoles]);

    const handleSendAndClose = () => {
        onSendMessage();
        onCloseLongForm();
    };

    // 处理证据提交
    const handleEvidenceSubmit = (payload: EvidenceInputPayload) => {
        if (onRespondToInterrupt) {
            onRespondToInterrupt(payload);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-surface-container-lowest min-w-0 md:min-w-[400px] relative rounded-t-3xl overflow-hidden mt-2 mx-2 shadow-sm border border-outline-variant/10">
            {/* 页眉 */}
            <div className="h-16 flex items-center justify-between px-6 z-20 sticky top-0 border-b-0 rounded-t-[32px] backdrop-blur-md bg-surface-container-lowest/80 border border-white/10">
                <div className="flex items-center gap-4">
                    {/* 多选角色过滤器 */}
                    <div className="flex gap-1 bg-surface-container p-1 rounded-full border border-outline-variant/30">
                        {/* 各角色切换按钮 */}
                        {ALL_ROLES.map(role => {
                            const isActive = visibleRoles.includes(role);
                            return (
                                <button
                                    key={role}
                                    onClick={() => toggleRole(role)}
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all focus:outline-none focus:ring-2 focus:ring-primary ${isActive
                                        ? 'bg-active text-on-primary shadow-sm'
                                        : 'text-on-surface-variant border border-outline-variant/30 hover:text-on-surface hover:bg-surface-container-high'
                                        }`}
                                >
                                    {ROLE_LABELS[role]}
                                </button>
                            );
                        })}
                    </div>

                    <div className="h-8 w-px bg-outline-variant/30 hidden md:block" />

                    {/* 状态信息 */}
                    <div className="hidden md:flex items-center gap-6 text-xs">
                        <div className="flex flex-col">
                            <span className="text-on-surface-variant font-bold uppercase text-[9px] tracking-widest">当前阶段</span>
                            <span className="font-bold text-primary text-sm">{currentPhase}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-on-surface-variant font-bold uppercase text-[9px] tracking-widest">当前发言</span>
                            <span className="font-bold text-primary text-sm">{currentSpeaker || '无'}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* 会话 ID */}
                    <div className="hidden md:flex items-center gap-6 text-xs border-l border-outline-variant/10 pl-6 h-8">
                        <div className="flex flex-col items-end">
                            <span className="text-on-surface-variant font-bold uppercase text-[9px] tracking-widest">会话 ID</span>
                            <span className="font-mono text-xs text-on-surface opacity-80 select-all">
                                {isConnected && sessionId ? sessionId : '未连接'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 消息列表 - 使用过滤后的消息 */}
            <MessageList messages={filteredMessages} roleFilter="all" />

            {/* 消息输入 - 多态组件 */}
            <MessageInput
                inputValue={inputValue}
                onInputChange={onInputChange}
                onSendMessage={onSendMessage}
                onExpandInput={onExpandInput}
                isTurnToSpeak={isTurnToSpeak}
                isLongFormMode={isLongFormMode}
                interruptState={interruptState}
                onRespondToInterrupt={onRespondToInterrupt}
                currentPhase={currentPhase}
                isConnected={isConnected}
            />

            {/* 证据选择浮动窗口 */}
            <EvidenceWindow
                isOpen={!!showEvidenceWindow}
                prompt={interruptState?.prompt || '请选择证据'}
                evidenceList={evidenceList}
                onSubmit={handleEvidenceSubmit}
                onClose={() => { }}
                winState={effectiveEvidenceWinState}
                updatePosition={handleUpdateEvidencePos}
                updateSize={handleUpdateEvidenceSize}
                onFocus={handleFocusEvidence}
            />

            {/* 详细输入窗口 */}
            <DetailedInputWindow
                isOpen={isLongFormMode}
                onClose={onCloseLongForm}
                inputValue={inputValue}
                setInputValue={onInputChange}
                handleSendMessage={handleSendAndClose}
                selectedRole={selectedRole}
                winState={inputWindowState}
                onFocus={onFocusInputWindow}
                updatePosition={onUpdateInputWindowPos}
                updateSize={onUpdateInputWindowSize}
            />
        </div>
    );
};

export default ChatArea;
