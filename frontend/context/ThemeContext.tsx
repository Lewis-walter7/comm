'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentColor = 'blue' | 'purple' | 'pink' | 'green' | 'orange';
export type FontSize = 'small' | 'medium' | 'large';
export type InterfaceDensity = 'compact' | 'comfortable' | 'spacious';

interface ThemeContextType {
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
    accentColor: AccentColor;
    setAccentColor: (color: AccentColor) => void;
    fontSize: FontSize;
    setFontSize: (size: FontSize) => void;
    interfaceDensity: InterfaceDensity;
    setInterfaceDensity: (density: InterfaceDensity) => void;
    animationsEnabled: boolean;
    setAnimationsEnabled: (enabled: boolean) => void;
    actualTheme: 'light' | 'dark'; // The actual computed theme (resolves 'system')
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEYS = {
    themeMode: 'theme-mode',
    accentColor: 'accent-color',
    fontSize: 'font-size',
    interfaceDensity: 'interface-density',
    animationsEnabled: 'animations-enabled',
};

const ACCENT_COLORS = {
    blue: {
        light: '#3b82f6',
        dark: '#60a5fa',
    },
    purple: {
        light: '#8b5cf6',
        dark: '#a78bfa',
    },
    pink: {
        light: '#ec4899',
        dark: '#f472b6',
    },
    green: {
        light: '#10b981',
        dark: '#34d399',
    },
    orange: {
        light: '#f97316',
        dark: '#fb923c',
    },
};

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [themeMode, setThemeModeState] = useState<ThemeMode>('dark'); // Default to dark
    const [accentColor, setAccentColorState] = useState<AccentColor>('blue');
    const [fontSize, setFontSizeState] = useState<FontSize>('medium');
    const [interfaceDensity, setInterfaceDensityState] = useState<InterfaceDensity>('comfortable');
    const [animationsEnabled, setAnimationsEnabledState] = useState(true);
    const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('dark'); // Default to dark
    const [mounted, setMounted] = useState(false);

    // Load preferences from localStorage on mount
    useEffect(() => {
        setMounted(true);

        const savedThemeMode = localStorage.getItem(STORAGE_KEYS.themeMode) as ThemeMode;
        const savedAccentColor = localStorage.getItem(STORAGE_KEYS.accentColor) as AccentColor;
        const savedFontSize = localStorage.getItem(STORAGE_KEYS.fontSize) as FontSize;
        const savedDensity = localStorage.getItem(STORAGE_KEYS.interfaceDensity) as InterfaceDensity;
        const savedAnimations = localStorage.getItem(STORAGE_KEYS.animationsEnabled);

        if (savedThemeMode) setThemeModeState(savedThemeMode);
        if (savedAccentColor) setAccentColorState(savedAccentColor);
        if (savedFontSize) setFontSizeState(savedFontSize);
        if (savedDensity) setInterfaceDensityState(savedDensity);
        if (savedAnimations !== null) setAnimationsEnabledState(savedAnimations === 'true');
    }, []);

    // Detect system theme preference and calculate actual theme
    useEffect(() => {
        if (!mounted) return;

        const getSystemTheme = (): 'light' | 'dark' => {
            if (typeof window === 'undefined') return 'dark';
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        };

        // If user selected a specific theme (light or dark), use that
        if (themeMode === 'light' || themeMode === 'dark') {
            setActualTheme(themeMode);
            return; // Don't set up system theme listener
        }

        // Only if themeMode is 'system', follow OS theme
        if (themeMode === 'system') {
            const updateSystemTheme = () => {
                const systemTheme = getSystemTheme();
                setActualTheme(systemTheme);
            };

            // Set initial system theme
            updateSystemTheme();

            // Listen for system theme changes
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handler = () => updateSystemTheme();
            mediaQuery.addEventListener('change', handler);
            
            return () => mediaQuery.removeEventListener('change', handler);
        }
    }, [themeMode, mounted]);

    // Apply theme to document
    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;

        // Apply theme class - explicitly add light or dark
        if (actualTheme === 'dark') {
            root.classList.remove('light');
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
            root.classList.add('light');
        }

        // Apply accent color
        const colorValues = ACCENT_COLORS[accentColor];
        root.style.setProperty('--accent-color', colorValues[actualTheme]);
        root.style.setProperty('--accent-color-light', colorValues.light);
        root.style.setProperty('--accent-color-dark', colorValues.dark);

        // Apply font size
        const fontSizeMap = {
            small: '14px',
            medium: '16px',
            large: '18px',
        };
        root.style.setProperty('--base-font-size', fontSizeMap[fontSize]);

        // Apply interface density
        const densityMap = {
            compact: '0.75',
            comfortable: '1',
            spacious: '1.25',
        };
        root.style.setProperty('--density-scale', densityMap[interfaceDensity]);

        // Apply animations preference
        if (!animationsEnabled) {
            root.style.setProperty('--animation-duration', '0s');
            root.style.setProperty('--transition-duration', '0s');
        } else {
            root.style.setProperty('--animation-duration', '0.3s');
            root.style.setProperty('--transition-duration', '0.2s');
        }
    }, [actualTheme, accentColor, fontSize, interfaceDensity, animationsEnabled, mounted]);

    const setThemeMode = (mode: ThemeMode) => {
        setThemeModeState(mode);
        localStorage.setItem(STORAGE_KEYS.themeMode, mode);
    };

    const setAccentColor = (color: AccentColor) => {
        setAccentColorState(color);
        localStorage.setItem(STORAGE_KEYS.accentColor, color);
    };

    const setFontSize = (size: FontSize) => {
        setFontSizeState(size);
        localStorage.setItem(STORAGE_KEYS.fontSize, size);
    };

    const setInterfaceDensity = (density: InterfaceDensity) => {
        setInterfaceDensityState(density);
        localStorage.setItem(STORAGE_KEYS.interfaceDensity, density);
    };

    const setAnimationsEnabled = (enabled: boolean) => {
        setAnimationsEnabledState(enabled);
        localStorage.setItem(STORAGE_KEYS.animationsEnabled, String(enabled));
    };

    return (
        <ThemeContext.Provider
            value={{
                themeMode,
                setThemeMode,
                accentColor,
                setAccentColor,
                fontSize,
                setFontSize,
                interfaceDensity,
                setInterfaceDensity,
                animationsEnabled,
                setAnimationsEnabled,
                actualTheme,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
