import React from 'react';

/**
 * ThinkingIndicator - 思考中动画指示器
 * 
 * 显示一组跳动的圆点，用于表示系统正在处理或生成回复。
 * 设计风格适配当前的毛玻璃/现代界面。
 */
const ThinkingIndicator: React.FC = () => {
    return (
        <div className="flex items-center justify-center gap-3 w-full h-full text-on-surface-variant/70">
            <span className="text-sm font-medium">其他地方正在思考/发言</span>
            <div className="flex space-x-1 pt-1">
                <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce"></div>
            </div>
        </div>
    );
};

export default ThinkingIndicator;
