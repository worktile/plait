import { Options } from 'roughjs/bin/core';
import { DEFAULT_STYLES } from '../constants/default';
import { EdgeDirection } from './types';

export const DEFAULT_EDGE_STYLES: Options = {
    ...DEFAULT_STYLES,
    stroke: '#ccc'
};

export const DEFAULT_ACTIVE_NODE_SIZE = 70;
export const DEFAULT_NODE_SIZE = 60;
export const DEFAULT_ACTIVE_BACKGROUND_NODE_ZOOM = 1.6;
export const DEFAULT_NODE_LABEL_MARGIN_TOP = 4;
export const DEFAULT_NODE_LABEL_FONT_SIZE = 12;

export const SECOND_DEPTH_NODE_ALPHA = 0.5; // 非第一深度节点的透明度
export const SECOND_DEPTH_LINE_ALPHA = 0.5; // 非第一深度线的透明度
export const ACTIVE_BACKGROUND_NODE_ALPHA = 0.1; // 激活节点背景圆透明度

export const DEFAULT_NODE_STYLES: Options = {
    ...DEFAULT_STYLES,
    fill: '#6698FF',
    strokeWidth: 0
};

export const DEFAULT_NODE_SCALING_RATIO = 600;

export const DEFAULT_LINE_STYLES = {
    color: {
        [EdgeDirection.IN]: 'green',
        [EdgeDirection.OUT]: '#6698FF',
        [EdgeDirection.NONE]: `rgba(204,204,204,${SECOND_DEPTH_LINE_ALPHA})`
    }
};
