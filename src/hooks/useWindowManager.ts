import { useState, useCallback, useMemo } from 'react';
import type {
    WindowState,
    WindowActions,
    InputWindowActions,
    UseWindowManagerReturn
} from '../types';

/**
 * useWindowManager - 用于管理可拖拽窗口状态的自定义 Hook。
 * 处理窗口生命周期：打开、关闭、聚焦、位置和尺寸更新。
 *
 * @param initialZIndex - 窗口堆叠的起始 z-index
 * @returns 用于管理可拖拽窗口的窗口状态和操作
 */
export function useWindowManager(initialZIndex: number = 100): UseWindowManagerReturn {
    // --- 证据/内容窗口 ---
    const [windows, setWindows] = useState<WindowState[]>([]);
    const [nextZIndex, setNextZIndex] = useState<number>(initialZIndex);

    // --- 输入窗口 (用于详细输入的特殊单例窗口) ---
    const [inputWindow, setInputWindow] = useState<WindowState>({
        id: 'detailed-input',
        x: 300, y: 100, w: 600, h: 400, zIndex: 1000
    });

    // --- 窗口操作 ---
    const openWindow = useCallback((
        title: string,
        content: string,
        type: string = 'text',
        url: string | null = null
    ): void => {
        setWindows(prev => {
            const existing = prev.find(w => w.title === title);
            if (existing) {
                // 将现有窗口置于最前，而不是打开新窗口
                return prev.map(w => w.id === existing.id
                    ? { ...w, zIndex: nextZIndex }
                    : w
                );
            }
            return [...prev, {
                id: Date.now(),
                title,
                content,
                type: type as WindowState['type'],
                url,
                x: 200 + (prev.length * 20), // 级联新窗口
                y: 150 + (prev.length * 20),
                w: 400,
                h: 300,
                zIndex: nextZIndex
            }];
        });
        setNextZIndex(z => z + 1);
    }, [nextZIndex]);

    const closeWindow = useCallback((id: string | number): void => {
        setWindows(prev => prev.filter(w => w.id !== id));
    }, []);

    const bringToFront = useCallback((id: string | number): void => {
        setWindows(prev => prev.map(w =>
            w.id === id ? { ...w, zIndex: nextZIndex } : w
        ));
        setNextZIndex(z => z + 1);
    }, [nextZIndex]);

    const updateWindowPosition = useCallback((id: string | number, x: number, y: number): void => {
        setWindows(prev => prev.map(w =>
            w.id === id ? { ...w, x, y } : w
        ));
    }, []);

    const updateWindowSize = useCallback((id: string | number, w: number, h: number): void => {
        setWindows(prev => prev.map(win =>
            win.id === id ? { ...win, w, h } : win
        ));
    }, []);

    // --- 输入窗口操作 ---
    const focusInputWindow = useCallback((): void => {
        setInputWindow(prev => ({ ...prev, zIndex: nextZIndex + 1 }));
        setNextZIndex(z => z + 2);
    }, [nextZIndex]);

    const updateInputWindowPosition = useCallback((_: string | number, x: number, y: number): void => {
        setInputWindow(prev => ({ ...prev, x, y }));
    }, []);

    const updateInputWindowSize = useCallback((_: string | number, w: number, h: number): void => {
        setInputWindow(prev => ({ ...prev, w, h }));
    }, []);

    // --- 缓存的操作对象 ---
    const windowActions: WindowActions = useMemo(() => ({
        open: openWindow,
        close: closeWindow,
        focus: bringToFront,
        updatePosition: updateWindowPosition,
        updateSize: updateWindowSize
    }), [openWindow, closeWindow, bringToFront, updateWindowPosition, updateWindowSize]);

    const inputWindowActions: InputWindowActions = useMemo(() => ({
        focus: focusInputWindow,
        updatePosition: updateInputWindowPosition,
        updateSize: updateInputWindowSize
    }), [focusInputWindow, updateInputWindowPosition, updateInputWindowSize]);

    return {
        windows,
        windowActions,
        inputWindow,
        inputWindowActions,
        nextZIndex
    };
}

export default useWindowManager;
