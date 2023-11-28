import { Options } from 'roughjs/bin/core';
import { DEFAULT_STYLES, PRIMARY_COLOR } from './default';
import { Direction } from '@plait/core';

export const DEFAULT_POSITIONS = [Direction.top, Direction.right, Direction.bottom, Direction.left];

export const HANDLE_DIAMETER = 8;

export const HANDLE_BUFFER = 6;

export const DEFAULT_HANDLE_STYLES: Options = {
    ...DEFAULT_STYLES,
    stroke: PRIMARY_COLOR,
    fill: '#fff'
};
