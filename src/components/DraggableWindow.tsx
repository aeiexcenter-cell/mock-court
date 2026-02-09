import React from 'react';
import { FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import WindowFrame from './WindowFrame';
import Button from './Button';
import type { WindowState } from '../types';

/** DraggableWindow 组件 Props */
export interface DraggableWindowProps {
    /** 窗口状态对象 */
    win: WindowState;
    /** 点击关闭按钮时的回调 */
    onClose: (id: string | number) => void;
    /** 窗口获得焦点时的回调 */
    onFocus: (id: string | number) => void;
    /** 更新位置的回调 */
    updatePosition: (id: string | number, x: number, y: number) => void;
    /** 更新尺寸的回调 */
    updateSize: (id: string | number, w: number, h: number) => void;
}

/**
 * DraggableWindow - 用于查看证据（图像、文件、文本）的窗口组件。
 * 使用 WindowFrame 实现拖拽/缩放功能。
 */
const DraggableWindow: React.FC<DraggableWindowProps> = ({
    win,
    onClose,
    onFocus,
    updatePosition,
    updateSize
}) => {
    return (
        <WindowFrame
            id={win.id}
            title={win.title || '窗口'}
            x={win.x} y={win.y} w={win.w} h={win.h} zIndex={win.zIndex}
            onClose={onClose} onFocus={onFocus} updatePosition={updatePosition} updateSize={updateSize}
        >
            <div className="flex-1 overflow-auto p-6 text-sm text-on-surface custom-scrollbar bg-surface-container-low">
                {win.type === 'image' ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <img src={win.url || ''} alt={win.title} className="max-w-full max-h-full object-contain rounded-lg shadow-sm" />
                    </div>
                ) : win.type === 'file' && win.url ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 text-on-surface-variant">
                        <div className="p-4 bg-surface-container-highest rounded-full">
                            <FileText size={48} />
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-lg mb-1">{win.title}</p>
                            <p className="text-xs opacity-70">PDF 文档</p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => window.open(win.url || '', '_blank')}>
                            在新标签页打开
                        </Button>
                    </div>
                ) : (
                    <div className="prose prose-sm max-w-none dark:prose-invert 
                        prose-headings:text-on-surface prose-p:text-on-surface 
                        prose-strong:text-on-surface prose-ul:text-on-surface 
                        prose-li:text-on-surface prose-table:text-on-surface 
                        prose-th:text-on-surface prose-td:text-on-surface 
                        prose-blockquote:text-on-surface-variant prose-blockquote:border-l-primary/50
                        prose-code:text-primary prose-code:bg-primary/10 prose-code:rounded prose-code:px-1 prose-code:py-0.5 prose-code:font-medium prose-code:before:content-none prose-code:after:content-none"
                    >
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                        >
                            {win.content}
                        </ReactMarkdown>
                    </div>
                )}
            </div>
        </WindowFrame>
    );
};

export default DraggableWindow;
