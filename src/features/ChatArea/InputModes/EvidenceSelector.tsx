import React, { useState } from 'react';
import Button from '../../../components/Button';
import { Send, FileText, XCircle, Layers } from 'lucide-react';
import type { BackendEvidence, EvidenceInputPayload } from '../../../types';

export type EvidenceShowType = 'single' | 'union' | 'quit';

export interface EvidenceSelectorProps {
    /** 显示给用户的提示文本 */
    prompt: string;
    /** 可选择的证据列表 */
    evidenceList: BackendEvidence[];
    /** 用户提交后的回调 */
    onSubmit: (payload: EvidenceInputPayload) => void;
    /** 是否禁用 */
    disabled?: boolean;
}

/**
 * EvidenceSelector - 证据选择组件
 * 
 * 用于需要证据响应的中断请求
 * 支持单一证据、联合证据和放弃举证三种模式
 */
const EvidenceSelector: React.FC<EvidenceSelectorProps> = ({
    prompt,
    evidenceList,
    onSubmit,
    disabled = false
}) => {
    const [showType, setShowType] = useState<EvidenceShowType>('single');
    const [selectedEvidence, setSelectedEvidence] = useState<BackendEvidence[]>([]);
    const [message, setMessage] = useState('');

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

    const isSubmitDisabled = disabled || (showType !== 'quit' && selectedEvidence.length === 0);

    return (
        <div className="w-full max-w-3xl mx-auto">
            {/* 玻璃态容器 */}
            <div className="bg-surface-container-high/80 backdrop-blur-xl rounded-2xl border border-outline-variant/30 p-6 shadow-lg">
                {/* 提示文本 */}
                <div className="text-center mb-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
                        <FileText size={14} />
                        证据提交
                    </div>
                    <p className="text-on-surface text-base font-medium">
                        {prompt}
                    </p>
                </div>

                {/* 举证模式选择 */}
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm text-on-surface-variant">举证模式：</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => { setShowType('single'); setSelectedEvidence([]); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${showType === 'single'
                                    ? 'bg-primary text-on-primary'
                                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                                }`}
                        >
                            单一证据
                        </button>
                        <button
                            onClick={() => { setShowType('union'); setSelectedEvidence([]); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${showType === 'union'
                                    ? 'bg-primary text-on-primary'
                                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                                }`}
                        >
                            <Layers size={12} />
                            联合证据
                        </button>
                        <button
                            onClick={() => { setShowType('quit'); setSelectedEvidence([]); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${showType === 'quit'
                                    ? 'bg-error text-white'
                                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                                }`}
                        >
                            <XCircle size={12} />
                            放弃举证
                        </button>
                    </div>
                </div>

                {/* 证据列表 */}
                {showType !== 'quit' && (
                    <div className="max-h-48 overflow-y-auto border border-outline-variant/20 rounded-xl p-2 space-y-2 mb-4 scrollbar-thin">
                        {evidenceList.length === 0 ? (
                            <div className="text-center py-6 text-on-surface-variant/60 text-sm">
                                暂无可用证据
                            </div>
                        ) : (
                            evidenceList.map(ev => {
                                const isSelected = selectedEvidence.some(s => s.id === ev.id);
                                return (
                                    <label
                                        key={ev.id}
                                        className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${isSelected
                                                ? 'bg-primary/15 border border-primary/30'
                                                : 'bg-surface-container hover:bg-surface-container-high border border-transparent'
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

                {/* 举证说明输入 */}
                {showType !== 'quit' && (
                    <div className="mb-4">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="举证说明（可选）..."
                            className="w-full bg-surface-container border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                        />
                    </div>
                )}

                {/* 提交按钮 */}
                <div className="flex justify-center">
                    <Button
                        variant={showType === 'quit' ? 'danger' : 'primary'}
                        size="lg"
                        disabled={isSubmitDisabled}
                        onClick={handleSubmit}
                        className="min-w-[160px] gap-2"
                    >
                        <Send size={18} />
                        <span>
                            {showType === 'quit' ? '确认放弃' : '提交证据'}
                        </span>
                    </Button>
                </div>

                {/* 选中状态提示 */}
                {showType !== 'quit' && selectedEvidence.length > 0 && (
                    <p className="text-center text-on-surface-variant/60 text-xs mt-3">
                        已选择 {selectedEvidence.length} 份证据
                    </p>
                )}
            </div>
        </div>
    );
};

export default EvidenceSelector;
