import React, { useState, useRef } from 'react';
import { Send, Maximize2 } from 'lucide-react';
// import Button from '../../../components/Button'; // No longer used directly

export interface StringInputProps {
    /** 用户提交后的回调 */
    onSubmit: (value: string) => void;
    /** 展开输入框回调 */
    onExpand: () => void;
    /** 是否禁用 */
    disabled?: boolean;
    /** 占位符文本 */
    placeholder?: string;
    /** 外部控制的输入值 (用于同步详细窗口) */
    value?: string;
    /** 外部控制的输入变化回调 */
    onChange?: (value: string) => void;
}

const StringInput: React.FC<StringInputProps> = ({
    onSubmit,
    onExpand,
    disabled = false,
    placeholder = '请输入您的回答...',
    value: externalValue,
    onChange: externalOnChange
}) => {
    // 使用内部状态或外部状态
    const [internalValue, setInternalValue] = useState('');
    const isControlled = externalValue !== undefined;

    const value = isControlled ? externalValue : internalValue;
    const setValue = (val: string) => {
        if (!isControlled) setInternalValue(val);
        externalOnChange?.(val);
    };

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValue(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
    };

    const handleSubmit = () => {
        if (value.trim()) {
            onSubmit(value.trim());
            // 清除输入值（内部和外部状态都需要清除）
            setInternalValue('');
            externalOnChange?.('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto">
            <div className="relative shadow-lg rounded-full bg-surface-container-high flex items-center p-2 border border-outline-variant/20 transition-all hover:bg-surface-container-highest hover:shadow-xl ring-0 focus-within:ring-2 ring-primary/50">
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    rows={1}
                    placeholder={placeholder}
                    className="flex-1 bg-transparent border-none text-on-surface px-4 text-sm focus:outline-none focus:ring-0 resize-none max-h-32 py-2.5 placeholder:text-on-surface-variant/50 disabled:opacity-50"
                />
                <div className="flex items-center gap-1 pr-1">
                    <button
                        className="p-2.5 rounded-full text-on-surface-variant hover:bg-primary hover:text-on-primary transition-colors disabled:opacity-50"
                        title="展开输入框"
                        disabled={disabled}
                        onClick={onExpand}
                    >
                        <Maximize2 size={18} />
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={disabled || !value.trim()}
                        className={`p-2.5 rounded-full transition-all duration-300 ${value.trim()
                            ? 'bg-primary text-on-primary shadow-md scale-100 hover:bg-primary/90'
                            : 'bg-surface-container text-on-surface-variant scale-95'
                            }`}
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
            <div className="text-center mt-2 text-[10px] text-on-surface-variant/40 font-medium">
                按 Enter 发送，Shift + Enter 换行
            </div>
        </div>
    );
};

export default StringInput;
