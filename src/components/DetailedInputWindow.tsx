import React from 'react';
import { Send } from 'lucide-react';
import WindowFrame from './WindowFrame';
import type { WindowState, UserRole } from '../types';

/** DetailedInputWindow 组件属性 */
export interface DetailedInputWindowProps {
    /** 窗口是否打开 */
    isOpen: boolean;
    /** 关闭窗口的回调 */
    onClose: (id: string | number) => void;
    /** 当前输入值 */
    inputValue: string;
    /** 更新输入值的回调 */
    setInputValue: (value: string) => void;
    /** 发送消息的回调 */
    handleSendMessage: () => void;
    /** 当前选中的角色 */
    selectedRole: UserRole;
    /** 窗口状态对象 */
    winState: WindowState;
    /** 更新窗口位置的回调 */
    updatePosition: (id: string | number, x: number, y: number) => void;
    /** 更新窗口尺寸的回调 */
    updateSize: (id: string | number, w: number, h: number) => void;
    /** 窗口获得焦点时的回调 */
    onFocus: () => void;
}

/**
 * DetailedInputWindow - 用于撰写较长陈述的模态窗口。
 * 为详细输入提供了更大的文本区域，并带有基于角色的样式。
 */
const DetailedInputWindow: React.FC<DetailedInputWindowProps> = ({
    isOpen,
    onClose,
    inputValue,
    setInputValue,
    handleSendMessage,
    selectedRole,
    winState,
    updatePosition,
    updateSize,
    onFocus
}) => {
    if (!isOpen) return null;

    const getButtonStyle = (): string => {
        if (selectedRole?.includes('Prosecutor')) {
            return 'bg-prosecutor-bg text-prosecutor';
        }
        if (selectedRole?.includes('Defense')) {
            return 'bg-defense-bg text-defense';
        }
        return 'bg-primary text-on-primary';
    };

    return (
        <WindowFrame
            id="detailed-input"
            title="详细输入编辑器"
            x={winState.x} y={winState.y} w={winState.w} h={winState.h} zIndex={winState.zIndex}
            onClose={onClose}
            onFocus={() => onFocus()}
            updatePosition={updatePosition}
            updateSize={updateSize}
        >
            <div className="flex-1 flex-col flex bg-surface-container-high">
                {/* 编辑器主体 */}
                <div className="flex-1 p-0 relative">
                    <textarea
                        autoFocus
                        className="w-full h-full bg-transparent border-none resize-none text-on-surface text-base p-6 focus:outline-none focus:ring-0 custom-scrollbar leading-relaxed"
                        placeholder="在此输入您的详细陈述..."
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                    />
                </div>

                {/* 底部操作栏 */}
                <div className="p-4 flex items-center justify-between border-t border-outline-variant/10 bg-surface-container/50 backdrop-blur-sm">
                    <div className="text-[10px] text-on-surface-variant/60 font-medium px-2">
                        提示: 拖动角落调整大小 • shift+enter 换行
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => onClose('detailed-input')}
                            className="px-5 py-2 rounded-full text-xs font-bold text-on-surface-variant hover:bg-surface-container-highest transition-colors"
                        >
                            取消
                        </button>
                        <button
                            onClick={() => { handleSendMessage(); onClose('detailed-input'); }}
                            className={`px-6 py-2 rounded-full text-xs font-bold transition-all shadow-sm hover:shadow-md active:scale-95 flex items-center gap-2 ${getButtonStyle()}`}
                        >
                            <Send size={14} />
                            提交陈述
                        </button>
                    </div>
                </div>
            </div>
        </WindowFrame>
    );
};

export default DetailedInputWindow;
