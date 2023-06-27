import { Options } from 'roughjs/bin/core';
import { DEFAULT_STYLES, PRIMARY_COLOR } from './default';

export const HIT_THRESHOLD = 10;

export const DEFAULT_EDGE_STYLES: Options = {
    ...DEFAULT_STYLES,
    stroke: '#ccc',
    fill: '#fff'
};

export const DEFAULT_EDGE_ACTIVE_STYLES: Options = {
    stroke: PRIMARY_COLOR
};

export const DEFAULT_PLACEHOLDER_EDGE_STYLES: Options = {
    stroke: PRIMARY_COLOR,
    strokeWidth: 1,
    strokeLineDash: [5]
};
