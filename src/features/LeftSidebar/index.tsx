import React from 'react';
import { Gavel } from 'lucide-react';
import EvidenceItem from '../../components/EvidenceItem';
import ThemeSelector from '../../components/ThemeSelector';
import type {
    LayoutConfig,
    CaseDataConfig,
    EvidenceDataConfig,
    NewEvidenceInputConfig,
    SessionInfoConfig,
} from '../../types';

/** 案件信息配置 */
export interface CaseInfoConfig {
    case_id: string;
    court_name: string;
    defendant_name: string;
    crime: string;
}

/** 使用分组配置接口的 LeftSidebar 组件 Props */
export interface LeftSidebarProps {
    layout: LayoutConfig;
    caseData: CaseDataConfig;
    evidenceData: EvidenceDataConfig;
    newEvidenceInput: NewEvidenceInputConfig;
    sessionInfo: SessionInfoConfig;
    caseInfo: CaseInfoConfig;
}

/**
 * LeftSidebar - 包含案情概况、证据链和系统日志。
 * Props 进行了分组以便更好地组织。
 */
const LeftSidebar: React.FC<LeftSidebarProps> = ({
    // 布局
    layout,
    // 案情概况 (分组)
    caseData,
    // 证据 (分组)
    evidenceData,
    // 会话状态 (分组) - 暂未使用
    sessionInfo: _sessionInfo,
    // 案件信息
    caseInfo
}) => {
    void _sessionInfo; // 标记为故意未使用
    // 为了方便，对分组后的 props 进行解构
    const { width, onStartResize } = layout;
    const { context: caseContext, onChange: onCaseContextChange } = caseData;
    const {
        file: fileEvidence,
        text: textEvidence,
        filter: evidenceFilter,
        onFilterChange: onEvidenceFilterChange,
        onOpen: onOpenWindow,
    } = evidenceData;

    // const { logs } = sessionInfo; // 日志已移除
    // const { isConnected, isTurnToSpeak } = sessionInfo; // 暂未使用

    const filteredFileEvidence = fileEvidence.filter(f => evidenceFilter === 'all' || f.speaker === evidenceFilter);
    const filteredTextEvidence = textEvidence.filter(t => evidenceFilter === 'all' || t.speaker === evidenceFilter);

    return (
        <div style={{ width }} className="flex flex-col bg-surface-container-low shrink-0 relative z-10 transition-colors duration-300 h-full">
            {/* 页眉 */}
            <div className="h-16 flex items-center justify-between px-6 font-bold tracking-tight text-primary text-lg shrink-0 z-20 bg-surface-container-low/80 backdrop-blur-md sticky top-0">
                <div className="flex items-center">
                    <Gavel className="h-6 w-6 mr-3 text-primary" /> AI 庭审系统
                </div>
                <ThemeSelector />
            </div>

            {/* 固定顶部区域：案件信息 + 案情概况 */}
            <div className="shrink-0 px-4 pb-4 space-y-4 border-b border-outline-variant/20">
                {/* 案件信息 */}
                <div className="space-y-2 p-3 bg-surface-container-high/50 rounded-xl border border-outline-variant/20">
                    <label className="text-xs font-bold text-on-surface-variant uppercase flex items-center gap-2">
                        <span>📋</span> 案件信息
                    </label>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-on-surface-variant">案件编号</span>
                            <span className="text-on-surface">{caseInfo.case_id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-on-surface-variant">法院</span>
                            <span className="text-on-surface">{caseInfo.court_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-on-surface-variant">被告人</span>
                            <span className="text-on-surface">{caseInfo.defendant_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-on-surface-variant">罪名</span>
                            <span className="text-error">{caseInfo.crime}</span>
                        </div>
                    </div>
                </div>

                {/* 案情概况 */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase">案情概况</label>
                    <textarea
                        className="w-full min-h-[80px] rounded-lg border border-outline-variant bg-surface-variant text-on-surface px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 resize-y placeholder-on-surface-variant/50"
                        value={caseContext}
                        onChange={e => onCaseContextChange(e.target.value)}
                    />
                </div>
            </div>

            {/* 可滚动区域：证据链 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {/* 证据链标题和过滤器 */}
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-on-surface-variant uppercase">证据链</label>
                    <div className="flex gap-1 bg-surface-container-high p-0.5 rounded border border-outline-variant/30">
                        {['all', '原告律师', '被告律师'].map(f => (
                            <button
                                key={f}
                                onClick={() => onEvidenceFilterChange(f)}
                                className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase transition-all ${evidenceFilter === f ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                            >
                                {f === 'all' ? '全部' : f === '原告律师' ? '原告' : '被告'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 文件证据列表 */}
                <div className="space-y-2">
                    {filteredFileEvidence.map((f, i) => (
                        <EvidenceItem
                            key={`file-${i}`}
                            type="file"
                            data={f}
                            index={i}
                            disabled={false}
                            onDelete={() => { }}
                            onOpen={onOpenWindow}
                        />
                    ))}
                </div>

                {/* 文本证据列表 */}
                <div className="flex flex-col gap-2">
                    {filteredTextEvidence.map((t, i) => (
                        <EvidenceItem
                            key={`text-${i}`}
                            type="text"
                            data={t}
                            index={i}
                            disabled={false}
                            onDelete={() => { }}
                            onOpen={onOpenWindow}
                        />
                    ))}
                </div>
            </div>

            {/* 调整大小的手柄 */}
            <div
                className="absolute top-0 bottom-0 -right-3 w-6 z-50 flex justify-center cursor-col-resize group touch-none"
                onMouseDown={onStartResize}
            >
                <div className="w-1 h-full rounded-full bg-transparent group-hover:bg-primary transition-colors duration-200 ease-in-out opacity-60" />
            </div>
        </div>
    );
};

export default LeftSidebar;
