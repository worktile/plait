import { FlowPosition } from './interfaces';
import { Options } from 'roughjs/bin/core';

export const OUTLINE_BUFFR = 3;

export const HANDLE_RADIUS = 8;

export const DEFAULT_POSITIONS = [FlowPosition.top, FlowPosition.right, FlowPosition.bottom, FlowPosition.left];

export const DEAFULT_STYLES: Options = {
    fillStyle: 'solid',
    strokeWidth: 2
};

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

export const DEAFULT_EDGE_STYLES: Options = {
    ...DEAFULT_STYLES,
    stroke: '#999'
};

export const DEAFULT_EDGE_ACTIVE_STYLES: Options = {
    stroke: 'rgb(38, 132, 255)'
};

export const DEAFULT_HANDLE_STYLES: Options = {
    ...DEAFULT_STYLES,
    stroke: '#6698FF',
    fill: '#fff'
};
