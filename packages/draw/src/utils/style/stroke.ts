import { PlaitBaseTable, PlaitDrawElement, StrokeStyle } from '../../interfaces';
import { DefaultDrawStyle } from '../../constants';
import { PlaitBoard, PlaitElement } from '@plait/core';
import { getDrawDefaultStrokeColor, getFlowchartDefaultFill } from '../geometry';
import { getStrokeWidthByElement, isDrawElementClosed } from '../common';

export const getStrokeColorByElement = (board: PlaitBoard, element: PlaitElement) => {
    const defaultColor = getDrawDefaultStrokeColor(board.theme.themeColorMode);
    const strokeColor = element.strokeColor || defaultColor;
    return strokeColor;
};

export const getFillByElement = (board: PlaitBoard, element: PlaitElement) => {
    const defaultFill =
        PlaitDrawElement.isFlowchart(element) && isDrawElementClosed(element as PlaitDrawElement)
            ? getFlowchartDefaultFill(board.theme.themeColorMode)
            : DefaultDrawStyle.fill;
    const fill = element.fill || defaultFill;
    return fill;
};

export const getLineDashByElement = (element: PlaitElement) => {
    switch (element.strokeStyle) {
        case StrokeStyle.dashed:
            return [8, 8 + getStrokeWidthByElement(element)];
        case StrokeStyle.dotted:
            return [0, 4 + getStrokeWidthByElement(element)];
        default:
            return undefined;
    }
};

export const getStrokeStyleByElement = (element: PlaitElement) => {
    return element.strokeStyle || StrokeStyle.solid;
};
