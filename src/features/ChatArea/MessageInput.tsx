import React, { useRef } from 'react';
import { Send, Maximize2 } from 'lucide-react';
import { BooleanInput, StringInput, EvidenceSelector } from './InputModes';
import type { InterruptState, BackendEvidence, EvidenceInputPayload } from '../../types';

export interface MessageInputProps {
    /** 文本输入值 */
    inputValue: string;
    /** 文本输入变化回调 */
    onInputChange: (value: string) => void;
    /** 发送消息回调 (旧版兼容) */
    onSendMessage: () => void;
    /** 展开输入框回调 */
    onExpandInput: () => void;
    /** 是否轮到用户发言 */
    isTurnToSpeak: boolean;
    /** 是否处于长文本模式 */
    isLongFormMode: boolean;
    /** 中断状态 (新增) */
    interruptState?: InterruptState;
    /** 证据列表 (新增) */
    evidenceList?: BackendEvidence[];
    /** 响应中断回调 (新增) */
    onRespondToInterrupt?: (input: boolean | string | EvidenceInputPayload) => void;
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
    evidenceList = [],
    onRespondToInterrupt
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
                return (
                    <div className={containerClass}>
                        <EvidenceSelector
                            prompt={interruptState.prompt}
                            evidenceList={evidenceList}
                            onSubmit={handleInterruptResponse}
                        />
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

    return (
        <div className={`
            absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4 z-30
            transition-all duration-300 ease-in-out
            ${isLongFormMode ? 'translate-y-[200%] opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}
        `}>
            <div className="relative shadow-lg rounded-full bg-surface-container-high flex items-center p-2 border border-outline-variant/20 transition-all hover:bg-surface-container-highest hover:shadow-xl ring-0 focus-within:ring-2 ring-primary/50">
                <textarea
                    ref={textareaRef}
                    disabled={!isTurnToSpeak}
                    rows={1}
                    className="flex-1 bg-transparent border-none text-on-surface px-4 text-sm focus:outline-none focus:ring-0 resize-none max-h-32 py-2.5 placeholder:text-on-surface-variant/50 disabled:opacity-50"
                    placeholder={isTurnToSpeak ? "输入您的发言..." : "等待其他方发言..."}
                    value={inputValue}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                />
                <div className="flex items-center gap-1 pr-1">
                    <button
                        className="p-2.5 rounded-full text-on-surface-variant hover:bg-primary hover:text-on-primary transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                        title="展开输入框"
                        disabled={!isTurnToSpeak}
                        onClick={onExpandInput}
                    >
                        <Maximize2 size={18} />
                    </button>
                    <button
                        onClick={onSendMessage}
                        disabled={!isTurnToSpeak}
                        className={`p-2.5 rounded-full transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${inputValue.trim()
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
