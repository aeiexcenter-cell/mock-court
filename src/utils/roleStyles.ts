import type { UIRole } from '../types';

/**
 * 庭审应用程序的基于角色的样式工具。
 * 集中了所有与角色相关的样式逻辑，以避免重复。
 */

interface StyleSet {
    self: string;
    other: string;
}

/**
 * 根据角色和所有权获取消息的气泡类名。
 * @param role - 消息发送者的角色
 * @param isSelf - 消息是否来自当前用户
 * @returns 消息气泡的 Tailwind CSS 类名
 */
export function getBubbleStyles(role: UIRole, isSelf: boolean = false): string {
    const baseRounded = 'rounded-2xl';

    const styles: Record<UIRole, StyleSet> = {
        judge: {
            self: `bg-judge-bg text-judge ${baseRounded} rounded-tr-sm shadow-md`,
            other: `bg-judge-bg/10 text-on-surface ${baseRounded} rounded-tl-sm border border-judge-bg/20`
        },
        prosecutor: {
            self: `bg-prosecutor-bg text-prosecutor ${baseRounded} rounded-tr-sm shadow-md`,
            other: `bg-prosecutor-bg/10 text-on-surface ${baseRounded} rounded-tl-sm border border-prosecutor-bg/20`
        },
        defense: {
            self: `bg-defense-bg text-defense ${baseRounded} rounded-tr-sm shadow-md`,
            other: `bg-defense-bg/10 text-on-surface ${baseRounded} rounded-tl-sm border border-defense-bg/20`
        },
        system: {
            self: `bg-system-bg text-system ${baseRounded} rounded-tl-sm shadow-sm`,
            other: `bg-system-bg/10 text-on-surface ${baseRounded} rounded-tl-sm shadow-sm border border-system-bg/20`
        },
        user: {
            self: `bg-secondary-container text-on-secondary-container rounded-br-sm ${baseRounded} border border-secondary-container/50`,
            other: `bg-secondary-container text-on-secondary-container rounded-br-sm ${baseRounded} border border-secondary-container/50`
        },
        clerk: {
            self: `bg-system-bg text-system ${baseRounded} rounded-tr-sm shadow-md`,
            other: `bg-system-bg/10 text-on-surface ${baseRounded} rounded-tl-sm border border-system-bg/20`
        }
    };

    const defaultStyle = `bg-surface-container-highest text-on-surface ${baseRounded} rounded-tl-sm`;

    const roleStyles = styles[role];
    if (!roleStyles) return defaultStyle;

    return isSelf ? roleStyles.self : roleStyles.other;
}

/**
 * 根据角色获取发言人徽章类名。
 * @param speaker - 发言人标识符 ('原告律师' 或 '被告律师')
 * @returns 徽章的 Tailwind CSS 类名
 */
export function getSpeakerBadgeStyles(speaker: string): string {
    return speaker === '原告律师'
        ? 'bg-prosecutor-bg text-prosecutor'
        : 'bg-defense-bg text-defense';
}

interface RoleColor {
    bg: string;
    text: string;
    border: string;
}

/**
 * 各种 UI 元素的角色颜色映射。
 */
export const ROLE_COLORS: Record<UIRole, RoleColor> = {
    judge: {
        bg: 'bg-judge-bg',
        text: 'text-judge',
        border: 'border-judge-bg'
    },
    prosecutor: {
        bg: 'bg-prosecutor-bg',
        text: 'text-prosecutor',
        border: 'border-prosecutor-bg'
    },
    defense: {
        bg: 'bg-defense-bg',
        text: 'text-defense',
        border: 'border-defense-bg'
    },
    system: {
        bg: 'bg-system-bg',
        text: 'text-system',
        border: 'border-system-bg'
    },
    user: {
        bg: 'bg-secondary-container',
        text: 'text-on-secondary-container',
        border: 'border-secondary-container'
    },
    clerk: {
        bg: 'bg-system-bg',
        text: 'text-system',
        border: 'border-system-bg'
    }
};
