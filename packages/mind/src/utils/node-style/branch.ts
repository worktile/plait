/**
 * Processing of branch color, width, style, etc. of the mind node
 */
import { PlaitBoard, isNullOrUndefined } from '@plait/core';
import { BranchShape, MindElement } from '../../interfaces/element';
import { BRANCH_WIDTH } from '../../constants/default';
import { DefaultAbstractNodeStyle } from '../../constants/node-style';
import { getAvailableProperty } from './common';
import { MindDefaultThemeColor, MindThemeColor } from '../../interfaces/theme-color';

export const getBranchColorByMindElement = (board: PlaitBoard, element: MindElement) => {
    const branchColor = getAvailableProperty(board, element, 'branchColor');
    return branchColor || getDefaultBranchColor(board, element);
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

export const getNextBranchColor = (board: PlaitBoard, root: MindElement) => {
    const index = root.children.length;
    return getDefaultBranchColorByIndex(board, index);
};

export const getDefaultBranchColor = (board: PlaitBoard, element: MindElement) => {
    const path = PlaitBoard.findPath(board, element);
    return getDefaultBranchColorByIndex(board, path[1]);
};

export const getDefaultBranchColorByIndex = (board: PlaitBoard, index: number) => {
    const themeColor = getMindThemeColor(board);
    const length = themeColor.branchColors.length;
    const remainder = index % length;
    return themeColor.branchColors[remainder];
};

export const getMindThemeColor = (board: PlaitBoard) => {
    const themeColors = PlaitBoard.getThemeColors(board);
    const themeColor = themeColors.find(val => val.mode === board.theme.themeColorMode);
    if (themeColor && MindThemeColor.isMindThemeColor(themeColor)) {
        return themeColor;
    } else {
        return MindDefaultThemeColor
    }
};
