import { PlaitBoard } from '@plait/core';
import { MindElement } from '../../interfaces/element';
import { COLORS, ROOT_NODE_STROKE } from '../../constants/node';

export const getStrokeByMindElement = (board: PlaitBoard, element: MindElement) => {
    const ancestors = MindElement.getAncestors(board, element) as MindElement[];
    ancestors.unshift(element);
    const ancestor = ancestors.find(value => value.strokeColor);
    if (ancestor && ancestor.strokeColor) {
        return ancestor.strokeColor;
    }

    const root = ancestors[ancestors.length - 1];
    const branch = ancestors[ancestors.length - 2];
    if (branch) {
        const index = root.children.indexOf(branch);
        const length = COLORS.length;
        const remainder = index % length;
        return COLORS[remainder];
    } else {
        return ROOT_NODE_STROKE;
    }
};
