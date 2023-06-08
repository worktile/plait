import { PlaitBoard } from '@plait/core';
import { MindElement, MindElementShape, PlaitMind } from '../../interfaces/element';
import { getAvailableProperty } from './common';
import { getDefaultBranchColor, getMindThemeColor } from './branch';

export const getStrokeByMindElement = (board: PlaitBoard, element: MindElement) => {
    if (PlaitMind.isMind(element)) {
        const defaultRootStroke = getMindThemeColor(board).rootFill;
        return element.strokeColor || defaultRootStroke;
    }

    const ancestors = MindElement.getAncestors(board, element) as MindElement[];
    ancestors.unshift(element);
    const ancestor = ancestors.find(value => value.strokeColor);
    if (ancestor && ancestor.strokeColor && !PlaitMind.isMind(ancestor)) {
        return ancestor.strokeColor;
    }
    return getDefaultBranchColor(board, element);
};

export const getShapeByElement = (board: PlaitBoard, element: MindElement): MindElementShape => {
    const shape = getAvailableProperty(board, element, 'shape');
    return shape || MindElementShape.roundRectangle;
};
