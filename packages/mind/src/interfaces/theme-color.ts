import { ThemeColor, ThemeColorMode } from '@plait/core';

export declare enum MindThemeColorMode {
    'xx' = 'xx'
}

export interface MindThemeColor extends ThemeColor {
    mode: MindThemeColorMode | ThemeColorMode | string;
    branchColors: string[];
}
