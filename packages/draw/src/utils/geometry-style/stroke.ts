import { PlaitBoard } from '@plait/core';
import { PlaitGeometry, PlaitLine } from '../../interfaces';
import { DefaultGeometryStyle } from '../../constants';

export const getStrokeWidthByElement = (element: PlaitGeometry | PlaitLine) => {
    const strokeWidth = element.strokeWidth || DefaultGeometryStyle.strokeWidth;
    return strokeWidth;
};

export const getStrokeColorByElement = (element: PlaitGeometry | PlaitLine) => {
    const strokeColor = element.strokeColor || DefaultGeometryStyle.strokeColor;
    return strokeColor;
};

export const getFillByElement = (element: PlaitGeometry | PlaitLine) => {
    const fill = element.fill || DefaultGeometryStyle.fill;
    return fill;
};

export const getLineDashByElement = (element: PlaitGeometry | PlaitLine) => {
    return [8, 8 + getStrokeWidthByElement(element)];
};
