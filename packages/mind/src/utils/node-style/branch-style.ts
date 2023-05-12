/**
 * Processing of branch color, width, style, etc. of the mind node
 */
import { PlaitBoard, PlaitNode } from '@plait/core';
import { MindElement } from '../../interfaces/element';
import { COLORS } from '../../constants/node';

export const getBranchColorByMindElement = (board: PlaitBoard, element: MindElement) => {
    const ancestors = MindElement.getAncestors(board, element) as MindElement[];
    ancestors.unshift(element);
    const ancestor = ancestors.find(value => value.branchColor);
    if (ancestor && ancestor.branchColor) {
        return ancestor.branchColor;
    }
    // default branch color
    const root = ancestors[ancestors.length - 1];
    const branch = ancestors[ancestors.length - 2];
    if (branch) {
        const index = root.children.indexOf(branch);
        const length = COLORS.length;
        const remainder = index % length;
        return COLORS[remainder];
    } else {
        throw new Error('root element should not have branch color');
    }
};

export const getNextBranchColor = (root: MindElement) => {
    const index = root.children.length;
    const length = COLORS.length;
    const remainder = index % length;
    return COLORS[remainder];
};
