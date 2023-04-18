import { Options } from 'roughjs/bin/core';
import { DEFAULT_STYLES } from './default';

export const OUTLINE_BUFFR = 3;

export const DEFAULT_NODE_STYLES: Options = {
    ...DEFAULT_STYLES,
    fill: 'rgb(223, 225, 230)',
    stroke: 'rgb(193, 199, 208)'
};

export const DEFAULT_NODE_ACTIVE_STYLES: Options = {
    stroke: '#4e8afa',
    fillStyle: 'solid',
    strokeWidth: 2,
    fill: ''
};
