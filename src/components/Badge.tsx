import React from 'react';
import type { UIRole } from '../types';

/** Badge 组件属性 */
export interface BadgeProps {
    /** 要显示的角色 */
    role: UIRole;
}

/**
 * Badge 组件，显示带有相应样式的角色标签。
 */
const Badge: React.FC<BadgeProps> = ({ role }) => {
    const colors: Record<UIRole, string> = {
        'judge': 'bg-judge-bg text-judge',
        'prosecutor': 'bg-prosecutor-bg text-prosecutor',
        'defense': 'bg-defense-bg text-defense',
        'system': 'bg-system-bg text-system',
        'user': 'bg-secondary-container text-on-secondary-container',
        'clerk': 'bg-system-bg text-system'
    };

    return (
        <span className={`px-2 py-0.5 rounded-full text-xxs uppercase font-bold tracking-wider ${colors[role] || colors['user']}`}>
            {role.toUpperCase()}
        </span>
    );
};

export default Badge;
