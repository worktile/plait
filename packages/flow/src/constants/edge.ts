import { Options } from 'roughjs/bin/core';
import { DEFAULT_STYLES } from './default';

export const HIT_THERSHOLD = 10;

export const DEFAULT_EDGE_STYLES: Options = {
    ...DEFAULT_STYLES,
    stroke: '#ccc',
    fill: '#fff'
};

export const DEFAULT_EDGE_ACTIVE_STYLES: Options = {
    stroke: 'rgb(38, 132, 255)'
};
