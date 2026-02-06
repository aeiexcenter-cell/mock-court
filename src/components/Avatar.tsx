import React from 'react';
import { Gavel, ShieldAlert, ShieldCheck, Cpu, User, BookOpen } from 'lucide-react';
import type { UIRole } from '../types';

/** Avatar 组件属性 */
export interface AvatarProps {
    /** 要显示的角色 */
    role: UIRole;
    /** 要应用的其他 CSS 类 */
    className?: string;
}

/**
 * Avatar 组件，显示带有相应样式的角色图标。
 */
const Avatar: React.FC<AvatarProps> = ({ role, className = '' }) => {
    const icons: Record<UIRole, React.ReactNode> = {
        'judge': <Gavel size={16} />,
        'prosecutor': <ShieldAlert size={16} />,
        'defense': <ShieldCheck size={16} />,
        'system': <Cpu size={16} />,
        'user': <User size={16} />,
        'clerk': <BookOpen size={16} />
    };

    const colors: Record<UIRole, string> = {
        'judge': 'bg-judge-bg text-judge',
        'prosecutor': 'bg-prosecutor-bg text-prosecutor',
        'defense': 'bg-defense-bg text-defense',
        'system': 'bg-system-bg text-system',
        'user': 'bg-secondary-container text-on-secondary-container',
        'clerk': 'bg-system-bg text-system'
    };

    return (
        <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${colors[role] || 'bg-surface-container-high'} ${className}`}>
            {icons[role] || <User size={16} />}
        </div>
    );
};

export default Avatar;
