import { DEAFULT_STYLES } from '../constants';
import { Options } from 'roughjs/bin/core';

export const OUTLINE_BUFFR = 3;

export const DEAFULT_NODE_STYLES: Options = {
    ...DEAFULT_STYLES,
    fill: 'rgb(223, 225, 230)',
    stroke: 'rgb(193, 199, 208)'
};

export const DEAFULT_NODE_ACTIVE_STYLES: Options = {
    stroke: '#4e8afa',
    fillStyle: 'solid',
    strokeWidth: 2,
    fill: ''
};
