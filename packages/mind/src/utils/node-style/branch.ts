/**
 * Processing of branch color, width, style, etc. of the mind node
 */
import { PlaitBoard, isNullOrUndefined } from '@plait/core';
import { MindElement } from '../../interfaces/element';
import { BRANCH_COLORS } from '../../constants/node-style';
import { BRANCH_WIDTH } from '../../constants/default';
import { DefaultAbstractNodeStyle } from '../../constants/node-style';

export const getBranchColorByMindElement = (board: PlaitBoard, element: MindElement) => {
    const ancestors = MindElement.getAncestors(board, element) as MindElement[];
    ancestors.unshift(element);
    const ancestor = ancestors.find(value => value.branchColor);
    if (ancestor && ancestor.branchColor) {
        return ancestor.branchColor;
    }

    const root = ancestors[ancestors.length - 1];
    const branch = ancestors[ancestors.length - 2];
    if (branch) {
        const index = root.children.indexOf(branch);
        const length = BRANCH_COLORS.length;
        const remainder = index % length;
        return BRANCH_COLORS[remainder];
    } else {
        throw new Error('root element should not have branch color');
    }
};

export const getBranchWidthByMindElement = (board: PlaitBoard, element: MindElement) => {
    const ancestors = MindElement.getAncestors(board, element) as MindElement[];
    ancestors.unshift(element);
    const ancestor = ancestors.find(value => value.branchColor);
    if (ancestor && ancestor.branchWidth) {
        return ancestor.branchWidth;
    }
    return BRANCH_WIDTH;
};

export const getAbstractBranchWidth = (board: PlaitBoard, element: MindElement) => {
    if (!isNullOrUndefined(element.branchWidth)) {
        return element.branchWidth;
    }
    return DefaultAbstractNodeStyle.branchWidth;
};

export const getAbstractBranchColor = (board: PlaitBoard, element: MindElement) => {
    if (element.branchColor) {
        return element.branchColor;
    }
    return DefaultAbstractNodeStyle.branchColor;
};

export const getNextBranchColor = (root: MindElement) => {
    const index = root.children.length;
    const length = BRANCH_COLORS.length;
    const remainder = index % length;
    return BRANCH_COLORS[remainder];
};
