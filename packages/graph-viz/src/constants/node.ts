import { Options } from 'roughjs/bin/core';
import { DEFAULT_STYLES } from './default';

export const DEFAULT_KNOWLEDGE_GRAPH_NODE_SIZE = 40;

export const DEFAULT_KNOWLEDGE_GRAPH_NODE_STYLES: Options = {
    ...DEFAULT_STYLES,
    fill: '#6698FF',
    stroke: 'rgb(193, 199, 208)'
};

export const DEFAULT_NODE_SCALING_RATIO = 100;
