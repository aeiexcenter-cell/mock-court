import React from 'react';
import { FileText, Image as ImageIcon } from 'lucide-react';
import { getSpeakerBadgeStyles } from '../utils/roleStyles';
import type { EvidenceType } from '../types';

/** 证据项类型 */
export type EvidenceItemType = 'file' | 'text';

/** EvidenceItem 的文件证据数据 */
export interface FileEvidenceData {
    id?: string; // Add id
    name: string;
    type: EvidenceType;
    url: string | null;
    speaker: string;
}

/** EvidenceItem 的文本证据数据 */
export interface TextEvidenceData {
    id?: string; // Add id
    name?: string; // Add name
    content: string;
    speaker: string;
}

/** EvidenceItem 组件属性 */
export interface EvidenceItemProps {
    /** 证据类型 */
    type: EvidenceItemType;
    /** 证据数据 */
    data: FileEvidenceData | TextEvidenceData;
    /** 在证据数组中的索引 */
    index: number;
    /** 编辑/删除是否已禁用 */
    disabled: boolean;
    /** 点击删除按钮时的回调 - 新设计中未使用 */
    onDelete: (index: number, isFile: boolean) => void;
    /** 点击项目以在窗口中打开时的回调 */
    onOpen: (title: string, content: string, type?: string, url?: string | null) => void;
    /** 文本证据内容更改的回调（仅限文本）- 新设计中未使用 */
    onEdit?: (index: number, value: string) => void;
}

/**
 * EvidenceItem - 用于在链中渲染证据的简化组件。
 * 显示 ID、名称和发言人。点击查看详情。
 * 不允许编辑或删除。
 */
const EvidenceItem: React.FC<EvidenceItemProps> = ({
    type,
    data,
    index,
    onOpen,
}) => {
    const isFile = type === 'file';
    const speakerClass = getSpeakerBadgeStyles(data.speaker);

    // 映射显示名称 (保留原始数据用于逻辑)
    const speakerDisplayMap: Record<string, string> = {
        '原告律师': '公诉方',
        '被告律师': '辩护方'
    };
    const displaySpeaker = speakerDisplayMap[data.speaker] || data.speaker;

    // 确定显示属性
    // 优先使用 data.name (文本和文件现在都有 name)，否则使用 data.id，最后回退到 index
    const displayName = data.name || (data.id ? `${data.id}` : `证据 #${index + 1}`);

    // 使用提供的 ID 或回退到索引
    const evidenceId = data.id || `EVI-${String(index + 1).padStart(3, '0')}`;

    // 在模态框中显示的内容
    // 修复：不再强制使用 "证据 #index"，而是优先使用名称或ID
    const modalTitle = data.name || `证据 ${evidenceId}`;
    const modalContent = isFile ? (data as FileEvidenceData).name : (data as TextEvidenceData).content;
    const modalType = isFile ? (data as FileEvidenceData).type : 'text';
    const modalUrl = isFile ? (data as FileEvidenceData).url : undefined;

    return (
        <div
            onClick={() => onOpen(modalTitle, modalContent, modalType, modalUrl)}
            className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest cursor-pointer transition-all hover:shadow-sm group relative overflow-hidden border border-transparent hover:border-outline-variant/30"
        >
            {/* ID Badge */}
            <div className="flex-shrink-0 font-mono text-[10px] bg-surface-container-highest/50 text-on-surface-variant px-1.5 py-0.5 rounded">
                {evidenceId}
            </div>

            {/* Icon */}
            <div className="shrink-0 text-primary opacity-80">
                {isFile && (data as FileEvidenceData).type === 'image' ? <ImageIcon size={16} /> : <FileText size={16} />}
            </div>

            {/* Name/Info */}
            <div className="flex-1 min-w-0 flex flex-col">
                <span className="text-sm font-medium truncate text-on-surface">
                    {displayName}
                </span>
                {/* Optional: Show snippet for text evidence? Requirement says "ID and Name only, click after to read content" */}
                {/* So we will hide the content here */}
            </div>

            {/* Speaker Badge */}
            <span className={`shrink-0 text-[9px] px-2 py-0.5 rounded-full font-bold tracking-wide uppercase ${speakerClass}`}>
                {displaySpeaker}
            </span>
        </div>
    );
};

export default EvidenceItem;
