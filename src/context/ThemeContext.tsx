import React, { createContext, useContext, useState } from 'react';

export type ThemeId =
    | 'default'
    | 'forest-light'
    | 'forest-dark'
    | 'forest-light-hc'
    | 'forest-dark-hc'
    | 'ocean-light'
    | 'ocean-dark'
    | 'ocean-light-hc'
    | 'ocean-dark-hc';

export interface ThemeOption {
    id: ThemeId;
    label: string;
    mode: 'light' | 'dark';
    family: 'gold' | 'forest' | 'ocean';
}

export const THEMES: ThemeOption[] = [
    { id: 'default', label: 'Vintage Gold', mode: 'light', family: 'gold' },

    { id: 'forest-light', label: 'Forest Light', mode: 'light', family: 'forest' },
    { id: 'forest-dark', label: 'Forest Dark', mode: 'dark', family: 'forest' },
    { id: 'forest-light-hc', label: 'Forest Light (HC)', mode: 'light', family: 'forest' },
    { id: 'forest-dark-hc', label: 'Forest Dark (HC)', mode: 'dark', family: 'forest' },

    { id: 'ocean-light', label: 'Ocean Blue', mode: 'light', family: 'ocean' },
    { id: 'ocean-dark', label: 'Ocean Dark', mode: 'dark', family: 'ocean' },
    { id: 'ocean-light-hc', label: 'Ocean Blue (HC)', mode: 'light', family: 'ocean' },
    { id: 'ocean-dark-hc', label: 'Ocean Dark (HC)', mode: 'dark', family: 'ocean' },
];

interface ThemeContextType {
    theme: ThemeId;
    setTheme: (theme: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<ThemeId>(() => {
        // 尝试从本地存储回复
        const saved = localStorage.getItem('court_theme');
        let initialTheme: ThemeId = 'default';
        if (saved && THEMES.some(t => t.id === saved)) {
            initialTheme = saved as ThemeId;
        }
        // 在初始化期间立即应用到 DOM 以防止闪烁
        document.documentElement.setAttribute('data-theme', initialTheme);
        return initialTheme;
    });

    // 使用 useLayoutEffect 确保在绘制前更新 DOM
    React.useLayoutEffect(() => {
        localStorage.setItem('court_theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const setTheme = (newTheme: ThemeId) => {
        setThemeState(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
