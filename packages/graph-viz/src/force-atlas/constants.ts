import { Options } from 'roughjs/bin/core';
import { DEFAULT_STYLES } from '../constants/default';
import { EdgeDirection } from './types';

export const DEFAULT_EDGE_STYLES: Options = {
    ...DEFAULT_STYLES,
    stroke: '#ccc'
};

export const DEFAULT_NODE_SIZE = 40;

export const DEFAULT_NODE_STYLES: Options = {
    ...DEFAULT_STYLES,
    fill: '#6698FF',
    stroke: 'rgb(193, 199, 208)'
};

export const DEFAULT_NODE_SCALING_RATIO = 100;

export const DEFAULT_LINE_STYLES = {
    color: {
        [EdgeDirection.IN]: 'green',
        [EdgeDirection.OUT]: '#6698FF',
        [EdgeDirection.NONE]: '#ccc'
    }
};
