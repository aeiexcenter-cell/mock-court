import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Palette, Check } from 'lucide-react';
import { useTheme, THEMES } from '../context/ThemeContext';
import Button from './Button';

const ThemeSelector: React.FC = () => {
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    // Calculate position when opening
    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + 8, // 8px spacing
                left: rect.left
            });
        }
    }, [isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('resize', () => setIsOpen(false));
            window.addEventListener('scroll', () => setIsOpen(false), true);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('resize', () => setIsOpen(false));
            window.removeEventListener('scroll', () => setIsOpen(false), true);
        };
    }, [isOpen]);

    return (
        <>
            <div ref={buttonRef} className="inline-block relative">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-primary hover:bg-primary/10 rounded-full w-8 h-8"
                    title="切换主题"
                >
                    <Palette size={18} />
                </Button>
            </div>

            {isOpen && createPortal(
                <div
                    ref={dropdownRef}
                    className="fixed w-64 bg-surface-container-high rounded-lg shadow-xl border border-outline-variant/20 py-2 z-[9999] overflow-hidden transform origin-top-left animate-in fade-in zoom-in-95 duration-100 max-h-[80vh] overflow-y-auto"
                    style={{ top: position.top, left: position.left }}
                >
                    {/* Vintage Gold */}
                    <div className="px-3 py-1.5 text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest bg-surface-container-highest/50">
                        Vintage Gold
                    </div>
                    {THEMES.filter(t => t.family === 'gold').map(t => (
                        <ThemeItem key={t.id} theme={t} currentTheme={theme} params={{ setTheme, setIsOpen }} />
                    ))}

                    <div className="h-px bg-outline-variant/10 my-1" />

                    {/* Forest Green */}
                    <div className="px-3 py-1.5 text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest bg-surface-container-highest/50">
                        Forest Green
                    </div>
                    {THEMES.filter(t => t.family === 'forest').map(t => (
                        <ThemeItem key={t.id} theme={t} currentTheme={theme} params={{ setTheme, setIsOpen }} />
                    ))}

                    <div className="h-px bg-outline-variant/10 my-1" />

                    {/* Ocean Blue */}
                    <div className="px-3 py-1.5 text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest bg-surface-container-highest/50">
                        Ocean Blue
                    </div>
                    {THEMES.filter(t => t.family === 'ocean').map(t => (
                        <ThemeItem key={t.id} theme={t} currentTheme={theme} params={{ setTheme, setIsOpen }} />
                    ))}
                </div>,
                document.body
            )}
        </>
    );
};

const ThemeItem = ({ theme, currentTheme, params }: { theme: any, currentTheme: string, params: any }) => (
    <button
        onClick={() => {
            params.setTheme(theme.id);
            params.setIsOpen(false);
        }}
        className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors
            ${currentTheme === theme.id
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-on-surface hover:bg-surface-container-highest'
            }
        `}
    >
        <span className="flex items-center gap-3">
            <span
                className={`w-4 h-4 rounded-full border border-black/10 shadow-sm shrink-0`}
                style={{
                    backgroundColor: getThemeColor(theme.family, theme.mode)
                }}
            />
            {theme.label}
        </span>
        {currentTheme === theme.id && <Check size={14} />}
    </button>
);

const getThemeColor = (family: string, mode: string) => {
    if (family === 'gold') return '#6d5e0f';
    if (family === 'forest') return mode === 'light' ? '#4c662b' : '#b1d18a';
    if (family === 'ocean') return mode === 'light' ? '#415f91' : '#aac7ff';
    return '#ccc';
};

export default ThemeSelector;
