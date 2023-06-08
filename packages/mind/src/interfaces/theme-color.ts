import {
    DefaultThemeColor,
    StarryThemeColor,
    ThemeColor,
    ThemeColorMode,
    DarkThemeColor,
    ColorfulThemeColor,
    SoftThemeColor,
    RetroThemeColor
} from '@plait/core';
import {
    COLORFUL_BRANCH_COLORS,
    DARK_BRANCH_COLORS,
    DEFAULT_BRANCH_COLORS,
    RETRO_BRANCH_COLORS,
    SOFT_BRANCH_COLORS,
    STARRY_BRANCH_COLORS
} from '../constants/theme';

export interface MindThemeColor extends ThemeColor {
    mode: ThemeColorMode | string;
    branchColors: string[];
    rootFill: string;
    rootTextColor: string;
}

export const MindDefaultThemeColor: MindThemeColor = {
    ...DefaultThemeColor,
    branchColors: DEFAULT_BRANCH_COLORS,
    rootFill: '#f5f5f5',
    rootTextColor: '#333333'
};

export const MindColorfulThemeColor: MindThemeColor = {
    ...ColorfulThemeColor,
    branchColors: COLORFUL_BRANCH_COLORS,
    rootFill: '#333333',
    rootTextColor: '#FFFFFF'
};

export const MindSoftThemeColor: MindThemeColor = {
    ...SoftThemeColor,
    branchColors: SOFT_BRANCH_COLORS,
    rootFill: '#FFFFFF',
    rootTextColor: '#333333'
};

export const MindRetroThemeColor: MindThemeColor = {
    ...RetroThemeColor,
    branchColors: RETRO_BRANCH_COLORS,
    rootFill: '#153D5D',
    rootTextColor: '#FFFFFF'
};

export const MindDarkThemeColor: MindThemeColor = {
    ...DarkThemeColor,
    branchColors: DARK_BRANCH_COLORS,
    rootFill: '#FFFFFF',
    rootTextColor: '#333333'
};

export const MindStarryThemeColor: MindThemeColor = {
    ...StarryThemeColor,
    branchColors: STARRY_BRANCH_COLORS,
    rootFill: '#FFFFFF',
    rootTextColor: '#333333'
};

export const MindThemeColor: MindThemeColor[] = [
    MindDefaultThemeColor,
    MindColorfulThemeColor,
    MindSoftThemeColor,
    MindRetroThemeColor,
    MindDarkThemeColor,
    MindStarryThemeColor
];
