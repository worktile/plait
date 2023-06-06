export interface PlaitTheme {
    themeColorMode: string;
}

export interface ThemeColor {
    mode: ThemeColorMode | string;
    boardBackground: string;
    elementStroke: string;
    elementFill: string;
    textColor: string;
}

export enum ThemeColorMode {
    'default' = 'default'
}

export const DefaultThemeColor: ThemeColor = {
    mode: ThemeColorMode.default,
    boardBackground: '#fff',
    elementStroke: '#000',
    elementFill: '#fff',
    textColor: '#000'
};
