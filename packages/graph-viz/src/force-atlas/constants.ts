import { Options } from 'roughjs/bin/core';
import { DEFAULT_STYLES } from '../constants/default';
import { EdgeDirection } from './types';

export const DEFAULT_EDGE_STYLES: Options = {
    ...DEFAULT_STYLES,
    stroke: '#ddd'
};

export const DEFAULT_NODE_SIZE = 30;

export const DEFAULT_ACTIVE_NODE_SIZE_MULTIPLIER = 1.2;

export const DEFAULT_ACTIVE_WAVE_NODE_SIZE_MULTIPLIER = 1.5;

export const DEFAULT_NODE_LABEL_MARGIN_TOP = 4;

export const DEFAULT_NODE_LABEL_FONT_SIZE = 12;

export const DEFAULT_NODE_LABEL_WIDTH = 72;

export const DEFAULT_NODE_LABEL_HEIGHT = 22;

export const DEFAULT_NODE_LABEL_STYLE = `user-select:none;max-width:${DEFAULT_NODE_LABEL_WIDTH}px;text-align:center;line-height:${DEFAULT_NODE_LABEL_HEIGHT}px;font-size:${DEFAULT_NODE_LABEL_FONT_SIZE}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;`;

export const NODE_LABEL_CLASS_NAME = 'force-atlas-node-label';

export const SECOND_DEPTH_NODE_ALPHA = 0.5;

export const SECOND_DEPTH_LINE_ALPHA = 0.5;

export const ACTIVE_BACKGROUND_NODE_ALPHA = 0.1;

export const NODE_ICON_CLASS_NAME = 'force-atlas-node-icon';

export const ACTIVE_NODE_ICON_CLASS_NAME = 'force-atlas-node-icon-active';

export const NODE_ICON_FONT_SIZE = 16;

export const ACTIVE_NODE_ICON_FONT_SIZE = 18;

export const DEFAULT_NODE_BACKGROUND_COLOR = '#9c9cfb';

export const DEFAULT_NODE_ICON_COLOR = '#fff';

export const DEFAULT_NODE_STYLES: Options = {
    ...DEFAULT_STYLES,
    fill: DEFAULT_NODE_BACKGROUND_COLOR,
    strokeWidth: 0
};

export const DEFAULT_NODE_SCALING_RATIO = 20;

export const DEFAULT_LINE_STYLES = {
    color: {
        [EdgeDirection.IN]: '#73D897',
        [EdgeDirection.OUT]: '#6698FF',
        [EdgeDirection.NONE]: `#eee`
    },
    opacity: {
        [EdgeDirection.IN]: 0.4,
        [EdgeDirection.OUT]: 0.4,
        [EdgeDirection.NONE]: 1
    }
};

export const DEFAULT_EDGE_PARTICLE_SIZE = 4;
