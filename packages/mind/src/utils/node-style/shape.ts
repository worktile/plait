import { PlaitBoard } from '@plait/core';
import { MindElement, MindElementShape, PlaitMind } from '../../interfaces/element';
import { getAvailableProperty } from './common';
import { getDefaultBranchColor, getMindThemeColor } from './branch';
import { AbstractNode } from '@plait/layouts';
import { isChildOfAbstract } from '../abstract/common';
import { DefaultAbstractNodeStyle, DefaultNodeStyle } from '../../constants/node-style';

export const getStrokeByMindElement = (board: PlaitBoard, element: MindElement) => {
    if (PlaitMind.isMind(element)) {
        const defaultRootStroke = getMindThemeColor(board).rootFill;
        return element.strokeColor || defaultRootStroke;
    }

    if (AbstractNode.isAbstract(element) || isChildOfAbstract(board, element)) {
        return element.strokeColor || DefaultAbstractNodeStyle.shape.strokeColor;
    }

    return getAvailableProperty(board, element, 'strokeColor') || getDefaultBranchColor(board, element);
};

export const getStrokeWidthByElement = (board: PlaitBoard, element: MindElement) => {
    const strokeWidth =
        element.strokeWidth ||
        (AbstractNode.isAbstract(element) ? DefaultAbstractNodeStyle.shape.strokeWidth : DefaultNodeStyle.shape.strokeWidth);
    return strokeWidth;
};

export const getFillByElement = (board: PlaitBoard, element: MindElement) => {
    if (element.fill) {
        return element.fill;
    }
    const defaultRootFill = getMindThemeColor(board).rootFill;
    return element.isRoot ? defaultRootFill : DefaultNodeStyle.shape.fill;
};

export const getShapeByElement = (board: PlaitBoard, element: MindElement): MindElementShape => {
    const shape = getAvailableProperty(board, element, 'shape');
    return shape || MindElementShape.roundRectangle;
};
