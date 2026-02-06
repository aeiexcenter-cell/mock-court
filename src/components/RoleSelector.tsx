/**
 * RoleSelector - 优质磨砂玻璃角色选择组件
 * 
 * 一个具有复古金和磨砂玻璃美学的自定义下拉菜单。
 * 特点是药丸形触发器、玻璃卡片下拉菜单和流畅的动画。
 */
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Lock } from 'lucide-react';
import type { UserRole } from '../types';

interface RoleSelectorProps {
    value: UserRole;
    onChange: (role: UserRole) => void;
    disabled?: boolean;
    className?: string;
}

interface RoleOption {
    value: UserRole;
    label: string;
    available: boolean;
}

const roleOptions: RoleOption[] = [
    { value: 'Defense AI', label: '辩护代理人', available: true },
    { value: 'Prosecutor AI', label: '公诉人', available: false },
    { value: 'Judge AI', label: '审判长', available: false },
    { value: 'Observer', label: '旁听', available: false },
];

const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
    'Defense AI': '辩护代理人',
    'Prosecutor AI': '公诉人',
    'Judge AI': '审判长',
    'Observer': '旁听',
};

export const RoleSelector: React.FC<RoleSelectorProps> = ({
    value,
    onChange,
    disabled = false,
    className = '',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // 点击外部时关闭下拉菜单
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // 按下 Escape 键时关闭
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen]);

    const handleSelect = (option: RoleOption) => {
        if (!option.available || disabled) return;
        onChange(option.value);
        setIsOpen(false);
    };

    const currentLabel = ROLE_DISPLAY_NAMES[value] || value;

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* 触发按钮 - 药丸形状 */}
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`
                    w-full flex items-center justify-between gap-3
                    px-5 py-3
                    rounded-full
                    bg-primary/5 backdrop-blur-md
                    border border-primary/20
                    text-on-surface
                    transition-all duration-200 ease-out
                    hover:bg-primary/10 hover:border-primary/30
                    focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-surface
                    ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                    ${isOpen ? 'bg-primary/10 border-primary/30 shadow-md' : ''}
                `}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                {/* 角色名称 */}
                <span className="font-semibold text-sm tracking-wide text-on-surface">
                    {currentLabel}
                </span>

                {/* 分隔线 + 箭头 */}
                <div className="flex items-center gap-2">
                    <div className="w-px h-4 bg-primary/20" />
                    <ChevronDown
                        size={16}
                        className={`
                            text-primary transition-transform duration-200
                            ${isOpen ? 'rotate-180' : ''}
                        `}
                    />
                </div>
            </button>

            {/* 下拉菜单 - 玻璃卡片 */}
            <div
                className={`
                    absolute z-50 mt-2 w-full min-w-[200px]
                    rounded-2xl
                    bg-surface-container-high/95 backdrop-blur-xl
                    border border-outline-variant/30
                    shadow-xl shadow-shadow/10
                    overflow-hidden
                    transition-all duration-200 ease-out origin-top
                    ${isOpen
                        ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                        : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                    }
                `}
                role="listbox"
                aria-activedescendant={value}
            >
                <div className="py-2">
                    {roleOptions.map((option) => {
                        const isSelected = option.value === value;
                        const isDisabled = !option.available;

                        return (
                            <button
                                key={option.value}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                disabled={isDisabled || disabled}
                                onClick={() => handleSelect(option)}
                                className={`
                                    w-full flex items-center justify-between gap-3
                                    px-4 py-2.5
                                    text-left text-sm
                                    transition-all duration-150
                                    ${isDisabled
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'cursor-pointer hover:bg-primary/10'
                                    }
                                    ${isSelected
                                        ? 'font-bold text-on-surface'
                                        : 'font-medium text-on-surface/80'
                                    }
                                `}
                            >
                                {/* 选项标签 */}
                                <span>
                                    {option.label}
                                </span>

                                {/* 状态图标 */}
                                {isDisabled ? (
                                    <Lock size={14} className="text-on-surface-variant/50" />
                                ) : isSelected ? (
                                    <Check size={16} className="text-primary" strokeWidth={2.5} />
                                ) : null}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default RoleSelector;
