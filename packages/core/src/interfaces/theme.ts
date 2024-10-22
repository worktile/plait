export interface PlaitTheme {
    themeColorMode: ThemeColorMode;
}

export interface ThemeColor {
    mode: ThemeColorMode | string;
    boardBackground?: string;
    textColor: string;
}

export enum ThemeColorMode {
    'default' = 'default',
    'colorful' = 'colorful',
    'soft' = 'soft',
    'retro' = 'retro',
    'dark' = 'dark',
    'starry' = 'starry'
}

export const DEFAULT_COLOR = '#333333';

export const DefaultThemeColor: ThemeColor = {
    mode: ThemeColorMode.default,
    boardBackground: '#ffffff',
    textColor: DEFAULT_COLOR
};

export const ColorfulThemeColor: ThemeColor = {
    mode: ThemeColorMode.colorful,
    boardBackground: '#ffffff',
    textColor: DEFAULT_COLOR
};

export const SoftThemeColor: ThemeColor = {
    mode: ThemeColorMode.soft,
    boardBackground: '#f5f5f5',
    textColor: DEFAULT_COLOR
};

export const RetroThemeColor: ThemeColor = {
    mode: ThemeColorMode.retro,
    boardBackground: '#f9f8ed',
    textColor: DEFAULT_COLOR
};

export const DarkThemeColor: ThemeColor = {
    mode: ThemeColorMode.dark,
    boardBackground: '#141414',
    textColor: '#FFFFFF'
};

export const StarryThemeColor: ThemeColor = {
    mode: ThemeColorMode.starry,
    boardBackground: '#0d2537',
    textColor: '#FFFFFF'
};

export const ThemeColors: ThemeColor[] = [
    DefaultThemeColor,
    ColorfulThemeColor,
    SoftThemeColor,
    RetroThemeColor,
    DarkThemeColor,
    StarryThemeColor
];
