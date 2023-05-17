import { PlaitBoard } from '@plait/core';
import { MindElement, MindElementShape } from '../../interfaces/element';
import { BRANCH_COLORS } from '../../constants/node-style';
import { DefaultRootStyle } from '../../constants/node-style';
import { getAvailableProperty } from './common';

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
        const length = BRANCH_COLORS.length;
        const remainder = index % length;
        return BRANCH_COLORS[remainder];
    } else {
        return DefaultRootStyle.strokeColor;
    }
};

export const getShapeByElement = (board: PlaitBoard, element: MindElement): MindElementShape => {
    const shape = getAvailableProperty(board, element, 'shape');
    return shape || MindElementShape.roundRectangle;
};
