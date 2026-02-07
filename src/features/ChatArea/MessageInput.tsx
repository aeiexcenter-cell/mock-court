import React, { useRef } from 'react';
import { Send, Maximize2 } from 'lucide-react';
import { BooleanInput, StringInput } from './InputModes';
import type { InterruptState, EvidenceInputPayload } from '../../types';
import ThinkingIndicator from '../../components/ThinkingIndicator';

export interface MessageInputProps {
    inputValue: string;
    onInputChange: (value: string) => void;
    onSendMessage: () => void;
    onExpandInput: () => void;
    isTurnToSpeak: boolean;
    isLongFormMode: boolean;
    interruptState?: InterruptState;
    onRespondToInterrupt?: (input: boolean | string | EvidenceInputPayload) => void;
    // 新增：状态相关
    currentPhase?: string;
    isConnected?: boolean;
}

/**
 * MessageInput - 多态输入组件
 * 
 * 根据中断状态动态渲染不同的输入类型：
 * - boolean: 是/否按钮
 * - string: 文本输入框
 * - evidence: 证据选择器
 * - 默认: 等待状态的药丸输入框
 */
const MessageInput: React.FC<MessageInputProps> = ({
    inputValue,
    onInputChange,
    onSendMessage,
    onExpandInput,
    isTurnToSpeak,
    isLongFormMode,
    interruptState,
    onRespondToInterrupt,
    currentPhase,
    isConnected
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // 检查是否有活跃的中断请求
    const isInterrupted = interruptState?.isInterrupted && interruptState.inputType;

    // 处理中断响应
    const handleInterruptResponse = (input: boolean | string | EvidenceInputPayload) => {
        if (onRespondToInterrupt) {
            onRespondToInterrupt(input);
        }
    };

    // 如果有中断请求，渲染对应的输入组件
    if (isInterrupted && interruptState) {
        const inputType = interruptState.inputType;

        // 容器样式 - 底部浮动 (紧凑型)
        const containerClass = `
            absolute bottom-6 left-1/2 -translate-x-1/2 w-full px-4 z-30
            transition-all duration-300 ease-in-out
            ${isLongFormMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}
        `;

        switch (inputType) {
            case 'boolean':
                return (
                    <div className={containerClass}>
                        <BooleanInput
                            onSubmit={handleInterruptResponse}
                        />
                    </div>
                );

            case 'evidence':
                // 证据选择现在由浮动窗口处理，这里显示提示状态
                return (
                    <div className={containerClass}>
                        <div className="w-full max-w-md mx-auto text-center py-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                                <span className="animate-pulse">●</span>
                                请在浮动窗口中选择证据
                            </div>
                        </div>
                    </div>
                );

            case 'string':
            default:
                return (
                    <div className={containerClass}>
                        <StringInput
                            onSubmit={(value) => handleInterruptResponse(value)}
                            onExpand={onExpandInput}
                            placeholder="请输入您的回答..."
                            value={inputValue}
                            onChange={onInputChange}
                        />
                    </div>
                );
        }
    }

    // 默认：标准药丸输入框（等待状态或旧版兼容）
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onInputChange(e.target.value);
        // 自动调整 textarea 高度
        e.target.style.height = 'auto';
        e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSendMessage();
        }
    };

    // Determine input state content
    const renderInputContent = () => {
        // 1. 庭审结束
        if (currentPhase === 'END' || currentPhase === '结案') {
            return (
                <div className="flex-1 flex items-center justify-center h-full py-2 text-on-surface-variant/50 text-sm">
                    庭审已结束
                </div>
            );
        }

        // 2. 庭审未开始 (未连接或处于开始阶段)
        // 只要不是 END 且 (未连接 或 phase 为空/START) 都视为未开始
        if (!isConnected || !currentPhase || currentPhase === 'START') {
            return (
                <div className="flex-1 flex items-center justify-center h-full py-2 text-on-surface-variant/50 text-sm">
                    庭审未开始
                </div>
            );
        }

        // 3. 庭审进行中 - 非发言回合 (思考/他人发言)
        if (!isTurnToSpeak) {
            return (
                <div className="flex-1 flex items-center justify-center h-full py-2">
                    <ThinkingIndicator />
                </div>
            );
        }

        // 4. 轮到发言 - 输入框
        return (
            <textarea
                ref={textareaRef}
                rows={1}
                className="flex-1 bg-transparent border-none text-on-surface px-4 text-sm focus:outline-none focus:ring-0 resize-none max-h-32 py-2.5 placeholder:text-on-surface-variant/50"
                placeholder="输入您的发言..."
                value={inputValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                autoFocus
            />
        );
    };

    return (
        <div className={`
            absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4 z-30
            transition-all duration-300 ease-in-out
            ${isLongFormMode ? 'translate-y-[200%] opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}
        `}>
            <div className="relative shadow-lg rounded-full bg-surface-container-high flex items-center p-2 border border-outline-variant/20 transition-all min-h-[56px] ring-0 focus-within:ring-2 ring-primary/50">
                {/* 动态渲染核心内容 */}
                {renderInputContent()}

                {/* 按钮区域 - 始终显示 (除了输入框本身被禁用外，按钮根据 isTurnToSpeak 禁用) */}
                <div className="flex items-center gap-1 pr-1">
                    <button
                        className="p-2.5 rounded-full text-on-surface-variant hover:bg-primary hover:text-on-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none disabled:opacity-50"
                        title="展开输入框"
                        onClick={onExpandInput}
                        disabled={!isTurnToSpeak}
                    >
                        <Maximize2 size={18} />
                    </button>
                    <button
                        onClick={onSendMessage}
                        disabled={!isTurnToSpeak}
                        className={`p-2.5 rounded-full transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none disabled:opacity-50 disabled:bg-surface-container-highest disabled:text-on-surface-variant/50 ${inputValue.trim() && isTurnToSpeak
                            ? 'bg-primary text-on-primary shadow-md scale-100 hover:bg-primary/90'
                            : 'bg-surface-container text-on-surface-variant scale-95'
                            }`}
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
            <div className="text-center mt-2 text-[10px] text-on-surface-variant/40 font-medium">
                {isTurnToSpeak ? '按下 Enter 发送，Shift + Enter 换行' : '庭审进行中，请等待...'}
            </div>
        </div>
    );
};

export default MessageInput;
