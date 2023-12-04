import { PlaitDrawElement, PlaitGeometry, PlaitLine, StrokeStyle } from '../../interfaces';
import { DefaultGeometryStyle } from '../../constants';
import { PlaitBoard } from '@plait/core';
import { getDrawDefaultStrokeColor, getFlowchartDefaultFill } from '../geometry';

export const getStrokeWidthByElement = (element: PlaitGeometry | PlaitLine) => {
    if (PlaitDrawElement.isText(element)) {
        return 0;
    }
    const strokeWidth = element.strokeWidth || DefaultGeometryStyle.strokeWidth;
    return strokeWidth;
};

export const getStrokeColorByElement = (board: PlaitBoard, element: PlaitGeometry | PlaitLine) => {
    const defaultColor = getDrawDefaultStrokeColor(board.theme.themeColorMode);
    const strokeColor = element.strokeColor || defaultColor;
    return strokeColor;
};

export const getFillByElement = (board: PlaitBoard, element: PlaitGeometry | PlaitLine) => {
    const defaultFill = PlaitDrawElement.isFlowchart(element)
        ? getFlowchartDefaultFill(board.theme.themeColorMode)
        : DefaultGeometryStyle.fill;
    const fill = element.fill || defaultFill;
    return fill;
};

export const getLineDashByElement = (element: PlaitGeometry | PlaitLine) => {
    return element.strokeStyle === 'dashed' ? [8, 8 + getStrokeWidthByElement(element)] : undefined;
};

export const getStrokeStyleByElement = (element: PlaitGeometry | PlaitLine) => {
    return element.strokeStyle || StrokeStyle.solid;
};
