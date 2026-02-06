import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

// 布局常量
const WINDOW_MIN_WIDTH = 300;
const WINDOW_MIN_HEIGHT = 200;

/** WindowFrame 组件 Props */
export interface WindowFrameProps {
    /** 窗口的唯一标识符 */
    id: string | number;
    /** 在页眉显示的窗口标题 */
    title: string;
    /** X 位置 (左侧偏移) */
    x: number;
    /** Y 位置 (顶部偏移) */
    y: number;
    /** 窗口宽度 */
    w: number;
    /** 窗口高度 */
    h: number;
    /** 堆叠顺序的 Z-index */
    zIndex: number;
    /** 点击关闭按钮时的回调 */
    onClose: (id: string | number) => void;
    /** 窗口获得焦点时的回调 */
    onFocus: (id: string | number) => void;
    /** 更新位置的回调 (id, x, y) */
    updatePosition: (id: string | number, x: number, y: number) => void;
    /** 更新尺寸的回调 (id, w, h) */
    updateSize: (id: string | number, w: number, h: number) => void;
    /** 窗口内容 */
    children: React.ReactNode;
}

/**
 * WindowFrame 组件 - 一个可重用的可拖拽且可缩放的窗口容器。
 */
const WindowFrame: React.FC<WindowFrameProps> = ({
    id,
    title,
    x,
    y,
    w,
    h,
    zIndex,
    onClose,
    onFocus,
    updatePosition,
    updateSize,
    children
}) => {
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const [isResizing, setIsResizing] = useState<boolean>(false);
    const resizeStart = useRef<{ x: number; y: number; w: number; h: number }>({ x: 0, y: 0, w: 0, h: 0 });

    const handleMouseDown = (e: React.MouseEvent): void => {
        e.stopPropagation();
        setIsDragging(true);
        onFocus(id);
        dragStart.current = { x: e.clientX - x, y: e.clientY - y };
    };

    const handleResizeStart = (e: React.MouseEvent): void => {
        e.stopPropagation();
        setIsResizing(true);
        onFocus(id);
        resizeStart.current = { x: e.clientX, y: e.clientY, w: w, h: h };
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent): void => {
            if (isDragging) {
                updatePosition(id, e.clientX - dragStart.current.x, e.clientY - dragStart.current.y);
            }
            if (isResizing) {
                const deltaX = e.clientX - resizeStart.current.x;
                const deltaY = e.clientY - resizeStart.current.y;
                updateSize(
                    id,
                    Math.max(WINDOW_MIN_WIDTH, resizeStart.current.w + deltaX),
                    Math.max(WINDOW_MIN_HEIGHT, resizeStart.current.h + deltaY)
                );
            }
        };

        const handleMouseUp = (): void => {
            setIsDragging(false);
            setIsResizing(false);
        };

        if (isDragging || isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, id, updatePosition, updateSize]);

    return (
        <div
            className="fixed rounded-[28px] bg-surface-container-high shadow-2xl border border-outline-variant/20 overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-200"
            style={{
                left: x,
                top: y,
                width: w,
                height: h,
                zIndex: zIndex,
                transition: (isDragging || isResizing) ? 'none' : 'box-shadow 0.2s'
            }}
            onMouseDown={() => onFocus(id)}
        >
            {/* 页眉栏 */}
            <div
                className="h-14 pl-6 pr-4 flex items-center justify-between cursor-move select-none shrink-0 border-b border-outline-variant/10 bg-surface-container-highest/50"
                onMouseDown={handleMouseDown}
            >
                <span className="text-sm font-bold text-on-surface truncate">{title}</span>
                <button
                    onClick={(e) => { e.stopPropagation(); onClose(id); }}
                    className="p-2 hover:bg-surface-container-highest rounded-full transition-colors text-on-surface-variant"
                >
                    <X size={18} />
                </button>
            </div>

            {/* 内容区域 */}
            <div className="flex-1 overflow-hidden relative flex flex-col">
                {children}
            </div>

            {/* 缩放手柄 */}
            <div
                className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize p-1 z-20 flex items-end justify-end opacity-50 hover:opacity-100"
                onMouseDown={handleResizeStart}
            >
                <div className="w-2 h-2 border-r-2 border-b-2 border-on-surface-variant rounded-br-sm mb-1 mr-1"></div>
            </div>
        </div>
    );
};

export default WindowFrame;
