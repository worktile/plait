import { Options } from 'roughjs/bin/core';
import { DEAFULT_STYLES } from './default';

export const HIT_THERSHOLD = 5;

export const DEAFULT_EDGE_STYLES: Options = {
    ...DEAFULT_STYLES,
    stroke: '#999'
};

export const DEAFULT_EDGE_ACTIVE_STYLES: Options = {
    stroke: 'rgb(38, 132, 255)'
};
