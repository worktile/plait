import { Options } from 'roughjs/bin/core';
import { FlowPosition } from '../interfaces/element';
import { DEFAULT_STYLES } from './default';

export const DEFAULT_POSITIONS = [FlowPosition.top, FlowPosition.right, FlowPosition.bottom, FlowPosition.left];

export const HANDLE_RADIUS = 8;

export const DEFAULT_HANDLE_STYLES: Options = {
    ...DEFAULT_STYLES,
    stroke: '#6698FF',
    fill: '#fff'
};
