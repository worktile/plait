import { Options } from 'roughjs/bin/core';
import { DEFAULT_STYLES } from './default';

export const HIT_THRESHOLD = 10;

export const DEFAULT_EDGE_STYLES: Options = {
    ...DEFAULT_STYLES,
    stroke: '#ccc',
    fill: '#fff'
};

export const DEFAULT_EDGE_ACTIVE_STYLES: Options = {
    stroke: 'rgb(38, 132, 255)'
};

export const DEFAULT_PLACEHOLDER_ACTIVE_STYLES: Options = {
    stroke: '#6698FF',
    strokeWidth: 1,
    strokeLineDash: [5]
};
