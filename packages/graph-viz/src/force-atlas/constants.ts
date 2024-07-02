import { Options } from 'roughjs/bin/core';
import { DEFAULT_STYLES } from '../constants/default';
import { EdgeDirection } from './types';

export const DEFAULT_EDGE_STYLES: Options = {
    ...DEFAULT_STYLES,
    stroke: '#ddd'
};

export const DEFAULT_NODE_SIZE = 60;
export const DEFAULT_ACTIVE_NODE_SIZE_MULTIPLIER = 1.2;
export const DEFAULT_ACTIVE_WAVE_NODE_SIZE_MULTIPLIER = 1.6;
export const DEFAULT_NODE_LABEL_MARGIN_TOP = 4;
export const DEFAULT_NODE_LABEL_FONT_SIZE = 12;

export const SECOND_DEPTH_NODE_ALPHA = 0.5;
export const SECOND_DEPTH_LINE_ALPHA = 0.5;
export const ACTIVE_BACKGROUND_NODE_ALPHA = 0.1;

export const DEFAULT_NODE_STYLES: Options = {
    ...DEFAULT_STYLES,
    fill: '#6698FF',
    strokeWidth: 0
};

export const DEFAULT_NODE_SCALING_RATIO = 600;

export const DEFAULT_LINE_STYLES = {
    color: {
        [EdgeDirection.IN]: '#73D897',
        [EdgeDirection.OUT]: '#6698FF',
        [EdgeDirection.NONE]: `#ddd`
    }
};
