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

export const DefaultThemeColor: ThemeColor = {
    mode: ThemeColorMode.default,
    boardBackground: '#ffffff',
    textColor: '#333333'
};

export const ColorfulThemeColor: ThemeColor = {
    mode: ThemeColorMode.colorful,
    boardBackground: '#ffffff',
    textColor: '#333333'
};

export const SoftThemeColor: ThemeColor = {
    mode: ThemeColorMode.soft,
    boardBackground: '#f5f5f5',
    textColor: '#333333'
};

export const RetroThemeColor: ThemeColor = {
    mode: ThemeColorMode.retro,
    boardBackground: '#f9f8ed',
    textColor: '#333333'
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
