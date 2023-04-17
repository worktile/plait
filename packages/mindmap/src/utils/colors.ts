import { NODE_TO_INDEX, PlaitBoard } from '@plait/core';
import { COLORS, ROOT_NODE_STROKE } from '../constants';
import { MindmapNodeElement } from '../interfaces';
import { findMindmapBranch } from './mindmap';

export const getStrokeByMindmapElement = (board: PlaitBoard, element: MindmapNodeElement) => {
    let stroke = element.strokeColor;
    if (stroke) {
        return stroke;
    }
    if (element.isRoot) {
        return ROOT_NODE_STROKE;
    } else {
        const branch = findMindmapBranch(board, element);
        const index = NODE_TO_INDEX.get(branch) || 0;
        const length = COLORS.length;
        const remainder = index % length;
        return COLORS[remainder];
    }
};

export const getLinkLineColorByMindmapElement = (board: PlaitBoard, element: MindmapNodeElement) => {
    let color = element.linkLineColor;
    if (color) {
        return color;
    }
    if (!element.isRoot) {
        const branch = findMindmapBranch(board, element);
        const index = NODE_TO_INDEX.get(branch) || 0;
        const length = COLORS.length;
        const remainder = index % length;
        return COLORS[remainder];
    } else {
        throw new Error('root element should not have link line');
    }
};

export const getRootLinkLineColorByMindmapElement = (root: MindmapNodeElement) => {
    const index = root.children.length;
    const length = COLORS.length;
    const remainder = index % length;
    return COLORS[remainder];
};
