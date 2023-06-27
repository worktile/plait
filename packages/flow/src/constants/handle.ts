import { Options } from 'roughjs/bin/core';
import { FlowPosition } from '../interfaces/element';
import { DEFAULT_STYLES, PRIMARY_COLOR } from './default';

export const DEFAULT_POSITIONS = [FlowPosition.top, FlowPosition.right, FlowPosition.bottom, FlowPosition.left];

export const HANDLE_DIAMETER = 8;

export const HANDLE_BUFFER = 6;

export const DEFAULT_HANDLE_STYLES: Options = {
    ...DEFAULT_STYLES,
    stroke: PRIMARY_COLOR,
    fill: '#fff'
};
