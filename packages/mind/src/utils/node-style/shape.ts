import { PlaitBoard } from '@plait/core';
import { MindElement, MindElementShape, PlaitMind } from '../../interfaces/element';
import { getAvailableProperty } from './common';
import { getDefaultBranchColor, getMindThemeColor } from './branch';
import { AbstractNode } from '@plait/layouts';
import { isChildOfAbstract } from '../abstract/common';
import { DefaultAbstractNodeStyle } from '../../constants/node-style';

export const getStrokeByMindElement = (board: PlaitBoard, element: MindElement) => {
    if (PlaitMind.isMind(element)) {
        const defaultRootStroke = getMindThemeColor(board).rootFill;
        return element.strokeColor || defaultRootStroke;
    }

    if (AbstractNode.isAbstract(element) || isChildOfAbstract(board, element)) {
        return element.strokeColor || DefaultAbstractNodeStyle.strokeColor;;
    }

    return getAvailableProperty(board, element, 'strokeColor') || getDefaultBranchColor(board, element);
};

export const getShapeByElement = (board: PlaitBoard, element: MindElement): MindElementShape => {
    const shape = getAvailableProperty(board, element, 'shape');
    return shape || MindElementShape.roundRectangle;
};
