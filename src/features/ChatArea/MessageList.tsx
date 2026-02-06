import React, { useRef, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import { ShieldCheck } from 'lucide-react';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import { getBubbleStyles } from '../../utils/roleStyles.ts';
import type { Message } from '../../types';

// ReactMarkdown 的净化配置
const SANITIZE_CONFIG = {
    ...defaultSchema,
    tagNames: [
        'p', 'b', 'i', 'strong', 'em', 'code', 'pre',
        'ul', 'ol', 'li', 'br', 'blockquote',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
    ],
    attributes: {
        '*': ['className'],
        'code': ['className'],
        'pre': ['className']
    }
};

export interface MessageListProps {
    messages: Message[];
    roleFilter: string;
}

/**
 * MessageList - 渲染带有自动滚动功能的聊天消息列表。
 */
const MessageList: React.FC<MessageListProps> = ({ messages, roleFilter }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 有新消息时自动滚动到底部
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // 使用 useMemo 缓存过滤结果，避免每次渲染重新计算
    const filteredMessages = useMemo(() => {
        return roleFilter === 'all'
            ? messages
            : messages.filter(m => m.role === roleFilter);
    }, [messages, roleFilter]);

    const showEmptyState = filteredMessages.length === 0;

    return (
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth pb-32">
            {filteredMessages.map(msg => {
                const isSelf = msg.isSelf || false;
                const bubbleClass = getBubbleStyles(msg.role, isSelf);

                // 系统消息渲染为精细的居中时间轴徽章
                if (msg.role === 'system') {
                    return (
                        <div key={msg.id} className="flex justify-center my-4">
                            <span className="text-xs text-on-surface-variant/70 bg-surface-container-high/60 
                                           px-4 py-1.5 rounded-full backdrop-blur-sm border border-outline-variant/10
                                           shadow-sm max-w-md text-center leading-relaxed">
                                {msg.content}
                            </span>
                        </div>
                    );
                }

                // 其他所有角色的标准消息气泡
                return (
                    <div
                        key={msg.id}
                        className={`flex gap-4 items-start max-w-3xl group ${isSelf ? 'ml-auto flex-row-reverse' : ''}`}
                    >
                        <Avatar role={msg.role} />
                        <div className={`space-y-1 min-w-0 flex-1 flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
                            <div className={`flex items-center gap-2 ${isSelf ? 'flex-row-reverse' : ''} opacity-80`}>
                                <span className="font-bold text-on-surface text-sm">{msg.name}</span>
                                <Badge role={msg.role} />
                                <span className="text-[10px] text-on-surface-variant font-medium">{msg.timestamp}</span>
                            </div>
                            <div className={`text-sm leading-relaxed px-5 py-3.5 shadow-sm whitespace-pre-wrap ${bubbleClass}
                prose prose-sm max-w-none
                prose-headings:text-inherit prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-strong:text-inherit`}
                            >
                                <ReactMarkdown rehypePlugins={[[rehypeSanitize, SANITIZE_CONFIG]]}>
                                    {msg.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* 空状态 */}
            {showEmptyState && (
                <div className="flex flex-col items-center justify-center p-10 opacity-20 select-none pointer-events-none absolute inset-0">
                    <div className="rounded-full bg-surface-container-highest p-8 mb-4">
                        <ShieldCheck size={64} className="text-on-surface-variant" strokeWidth={1} />
                    </div>
                    <p className="text-lg font-medium text-on-surface-variant">庭审系统已就绪</p>
                </div>
            )}

            <div ref={messagesEndRef} />
        </div>
    );
};

export default React.memo(MessageList);
