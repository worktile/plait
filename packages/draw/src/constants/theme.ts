import { DEFAULT_COLOR, ThemeColorMode } from '@plait/core';

export const DrawThemeColors = {
    [ThemeColorMode.default]: {
        strokeColor: DEFAULT_COLOR,
        fill: '#FFFFFF'
    },
    [ThemeColorMode.colorful]: {
        strokeColor: '#06ADBF',
        fill: '#CDEFF2'
    },
    [ThemeColorMode.soft]: {
        strokeColor: '#6D89C1',
        fill: '#DADFEB'
    },
    [ThemeColorMode.retro]: {
        strokeColor: '#E9C358',
        fill: '#F6EDCF'
    },
    [ThemeColorMode.dark]: {
        strokeColor: '#FFFFFF',
        fill: '#434343'
    },
    [ThemeColorMode.starry]: {
        strokeColor: '#42ABE5',
        fill: '#163F5A'
    }
};
