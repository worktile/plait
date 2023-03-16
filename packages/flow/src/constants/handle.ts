import { Options } from 'roughjs/bin/core';
import { FlowPosition } from '../interfaces/element';
import { DEAFULT_STYLES } from './default';

export const DEFAULT_POSITIONS = [FlowPosition.top, FlowPosition.right, FlowPosition.bottom, FlowPosition.left];

export const HANDLE_RADIUS = 8;

export const DEAFULT_HANDLE_STYLES: Options = {
    ...DEAFULT_STYLES,
    stroke: '#6698FF',
    fill: '#fff'
};
