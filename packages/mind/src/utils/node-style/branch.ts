/**
 * Processing of branch color, width, style, etc. of the mind node
 */
import { PlaitBoard, isNullOrUndefined } from '@plait/core';
import { BranchShape, MindElement } from '../../interfaces/element';
import { BRANCH_COLORS } from '../../constants/node-style';
import { BRANCH_WIDTH } from '../../constants/default';
import { DefaultAbstractNodeStyle } from '../../constants/node-style';
import { getAvailableProperty } from './common';

export const getBranchColorByMindElement = (board: PlaitBoard, element: MindElement) => {
    const branchColor = getAvailableProperty(board, element, 'branchColor');
    const parentBranchColor = MindElement.getParent(element)?.branchColor;
    return parentBranchColor || branchColor || getDefaultBranchColor(board, element);
};

export const getBranchShapeByMindElement = (board: PlaitBoard, element: MindElement) => {
    const branchShape = getAvailableProperty(board, element, 'branchShape');
    return branchShape || BranchShape.bight;
};

export const getBranchWidthByMindElement = (board: PlaitBoard, element: MindElement) => {
    const branchWidth = getAvailableProperty(board, element, 'branchWidth');
    return branchWidth || BRANCH_WIDTH;
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
    return getDefaultBranchColorByIndex(index);
};

export const getDefaultBranchColor = (board: PlaitBoard, element: MindElement) => {
    const path = PlaitBoard.findPath(board, element);
    return getDefaultBranchColorByIndex(path[1]);
};

export const getDefaultBranchColorByIndex = (index: number) => {
    const length = BRANCH_COLORS.length;
    const remainder = index % length;
    return BRANCH_COLORS[remainder];
};
