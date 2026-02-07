import React, { useState, useRef, useEffect } from 'react';
import { Send, FileText, XCircle, Layers, GripVertical } from 'lucide-react';
import WindowFrame from './WindowFrame';
import Button from './Button';
import type { BackendEvidence, EvidenceInputPayload, WindowState } from '../types';

export type EvidenceShowType = 'single' | 'union' | 'quit';

export interface EvidenceWindowProps {
    /** 是否显示 */
    isOpen: boolean;
    /** 显示给用户的提示文本 */
    prompt: string;
    /** 可选择的证据列表 */
    evidenceList: BackendEvidence[];
    /** 用户提交后的回调 */
    onSubmit: (payload: EvidenceInputPayload) => void;
    /** 关闭窗口回调 */
    onClose: (id: string | number) => void;
    /** 窗口状态对象 */
    winState: WindowState;
    /** 更新位置回调 */
    updatePosition: (id: string | number, x: number, y: number) => void;
    /** 更新尺寸回调 */
    updateSize: (id: string | number, w: number, h: number) => void;
    /** 窗口获得焦点回调 */
    onFocus: () => void;
}

/**
 * EvidenceWindow - 浮动证据选择窗口
 * 
 * 可拖动、可调整大小的证据选择界面
 * 支持单一证据、联合证据和放弃举证三种模式
 */
const EvidenceWindow: React.FC<EvidenceWindowProps> = ({
    isOpen,
    prompt,
    evidenceList,
    onSubmit,
    onClose,
    winState,
    updatePosition,
    updateSize,
    onFocus
}) => {
    const [showType, setShowType] = useState<EvidenceShowType>('single');
    const [selectedEvidence, setSelectedEvidence] = useState<BackendEvidence[]>([]);
    const [message, setMessage] = useState('');
    const [textareaHeight, setTextareaHeight] = useState(80);
    const resizeRef = useRef<{ startY: number; startHeight: number } | null>(null);

    // 处理输入区拖拽调整大小
    const handleResizeMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        resizeRef.current = { startY: e.clientY, startHeight: textareaHeight };
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (resizeRef.current) {
                const deltaY = resizeRef.current.startY - e.clientY;
                const newHeight = Math.max(60, Math.min(300, resizeRef.current.startHeight + deltaY));
                setTextareaHeight(newHeight);
            }
        };
        const handleMouseUp = () => {
            resizeRef.current = null;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    if (!isOpen) return null;

    const handleEvidenceToggle = (evidence: BackendEvidence) => {
        setSelectedEvidence(prev => {
            const exists = prev.find(e => e.id === evidence.id);
            if (exists) {
                return prev.filter(e => e.id !== evidence.id);
            }
            // 单一模式只保留一个
            if (showType === 'single') {
                return [evidence];
            }
            return [...prev, evidence];
        });
    };

    const handleSubmit = () => {
        let payload: EvidenceInputPayload;

        if (showType === 'quit') {
            payload = {
                current_evidence: null,
                messages: '放弃举证'
            };
        } else if (showType === 'single' && selectedEvidence.length > 0) {
            payload = {
                current_evidence: selectedEvidence[0],
                messages: message || ''
            };
        } else {
            payload = {
                current_evidence: selectedEvidence,
                messages: message || ''
            };
        }

        onSubmit(payload);
    };

    const isSubmitDisabled = showType !== 'quit' && selectedEvidence.length === 0;

    return (
        <WindowFrame
            id="evidence-window"
            title="证据提交"
            x={winState.x}
            y={winState.y}
            w={winState.w}
            h={winState.h}
            zIndex={winState.zIndex}
            onClose={onClose}
            onFocus={() => onFocus()}
            updatePosition={updatePosition}
            updateSize={updateSize}
        >
            <div className="flex-1 flex flex-col bg-surface-container-high overflow-hidden">
                {/* 提示文本 */}
                <div className="px-5 py-4 border-b border-outline-variant/10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-2">
                        <FileText size={14} />
                        证据提交
                    </div>
                    <p className="text-on-surface text-sm font-medium leading-relaxed">
                        {prompt}
                    </p>
                </div>

                {/* 举证模式选择 */}
                <div className="flex items-center gap-3 px-5 py-3 border-b border-outline-variant/10 bg-surface-container/50">
                    <span className="text-xs text-on-surface-variant">举证模式：</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => { setShowType('single'); setSelectedEvidence([]); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${showType === 'single'
                                ? 'bg-primary text-on-primary'
                                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-highest'
                                }`}
                        >
                            单一证据
                        </button>
                        <button
                            onClick={() => { setShowType('union'); setSelectedEvidence([]); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${showType === 'union'
                                ? 'bg-primary text-on-primary'
                                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-highest'
                                }`}
                        >
                            <Layers size={12} />
                            联合证据
                        </button>
                        <button
                            onClick={() => { setShowType('quit'); setSelectedEvidence([]); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${showType === 'quit'
                                ? 'bg-error text-white'
                                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-highest'
                                }`}
                        >
                            <XCircle size={12} />
                            放弃举证
                        </button>
                    </div>
                </div>

                {/* 证据列表 */}
                {showType !== 'quit' && (
                    <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                        {evidenceList.length === 0 ? (
                            <div className="text-center py-10 text-on-surface-variant/60 text-sm">
                                暂无可用证据
                            </div>
                        ) : (
                            evidenceList.map(ev => {
                                const isSelected = selectedEvidence.some(s => s.id === ev.id);
                                return (
                                    <label
                                        key={ev.id}
                                        className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${isSelected
                                            ? 'bg-primary/15 border border-primary/30'
                                            : 'bg-surface-container hover:bg-surface-container-highest border border-transparent'
                                            }`}
                                    >
                                        <input
                                            type={showType === 'single' ? 'radio' : 'checkbox'}
                                            checked={isSelected}
                                            onChange={() => handleEvidenceToggle(ev)}
                                            className="mt-1 w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary focus:ring-offset-surface-container"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-sm text-on-surface">
                                                    [{ev.id}] {ev.name}
                                                </span>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${ev.provider === 'prosecutor'
                                                    ? 'bg-prosecutor/20 text-prosecutor'
                                                    : 'bg-defense/20 text-defense'
                                                    }`}>
                                                    {ev.provider === 'prosecutor' ? '控方' : '辩方'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-on-surface-variant/70 mt-1 line-clamp-2">
                                                {ev.content}
                                            </p>
                                        </div>
                                    </label>
                                );
                            })
                        )}
                    </div>
                )}

                {/* 放弃举证时的占位 */}
                {showType === 'quit' && (
                    <div className="flex-1 flex items-center justify-center text-on-surface-variant/60 text-sm">
                        点击下方按钮确认放弃举证
                    </div>
                )}

                {/* 举证说明输入区（可调节大小） */}
                {showType !== 'quit' && (
                    <div className="border-t border-outline-variant/10">
                        {/* 拖拽调节手柄 */}
                        <div
                            className="h-3 flex items-center justify-center cursor-ns-resize hover:bg-surface-container-highest/50 transition-colors"
                            onMouseDown={handleResizeMouseDown}
                        >
                            <GripVertical size={14} className="text-on-surface-variant/40 rotate-90" />
                        </div>
                        <div className="px-4 pb-3">
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="举证说明（可选）..."
                                style={{ height: textareaHeight }}
                                className="w-full bg-surface-container border border-outline-variant/30 rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 resize-none custom-scrollbar"
                            />
                        </div>
                    </div>
                )}

                {/* 底部操作栏 */}
                <div className="p-4 flex items-center justify-between border-t border-outline-variant/10 bg-surface-container/50 backdrop-blur-sm shrink-0">
                    <div className="text-[10px] text-on-surface-variant/60 font-medium">
                        {showType !== 'quit' && selectedEvidence.length > 0 && (
                            <span>已选择 {selectedEvidence.length} 份证据</span>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => onClose('evidence-window')}
                            className="px-5 py-2 rounded-full text-xs font-bold text-on-surface-variant hover:bg-surface-container-highest transition-colors"
                        >
                            取消
                        </button>
                        <Button
                            variant={showType === 'quit' ? 'danger' : 'primary'}
                            size="md"
                            disabled={isSubmitDisabled}
                            onClick={handleSubmit}
                            className="gap-2"
                        >
                            <Send size={14} />
                            <span>{showType === 'quit' ? '确认放弃' : '提交证据'}</span>
                        </Button>
                    </div>
                </div>
            </div>
        </WindowFrame>
    );
};

export default EvidenceWindow;
