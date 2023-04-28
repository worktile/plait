import { BASE } from './default';

export const TOPIC_COLOR = '#333';
export const TOPIC_FONT_SIZE = 14;
export const NODE_FILL = '#FFFFFF';
export const ROOT_NODE_FILL = '#F5F5F5';
export const ROOT_NODE_STROKE = '#F5F5F5';
export const ROOT_TOPIC_FONT_SIZE = 18;
export const NODE_MIN_WIDTH = 18;

export const COLORS = ['#A287E1', '#6F81DB', '#6EC4C4', '#DFB85D', '#B1C774', '#77C386', '#C28976', '#E48484', '#E482D4', '#69B1E4'];

export enum MindmapNodeShape {
    roundRectangle = 'round-rectangle',
    underline = 'underline'
}

export const ROOT_NODE_TEXT_HORIZONTAL_GAP = BASE * 4;
export const ROOT_NODE_TEXT_VERTICAL_GAP = BASE * 2;

export const CHILD_NODE_TEXT_HORIZONTAL_GAP = BASE * 3;
export const CHILD_NODE_TEXT_VERTICAL_GAP = BASE * 1.5;

export const ABSTRACT_HANDLE_COLOR = '#6698FF80'; //PRIMARY_COLOR 50% 透明度
export const ABSTRACT_INCLUDED_OUTLINE_OFFSET = 3.5;
export const ABSTRACT_HANDLE_LENGTH = 12;
