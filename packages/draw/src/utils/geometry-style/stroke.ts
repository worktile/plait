import { PlaitBoard } from '@plait/core';
import { PlaitGeometry, PlaitLine } from '../../interfaces';
import { DefaultGeometryStyle } from '../../constants';

export const getStrokeWidthByElement = (board: PlaitBoard, element: PlaitGeometry | PlaitLine) => {
    const strokeWidth = element.strokeWidth || DefaultGeometryStyle.strokeWidth;
    return strokeWidth;
};

export const getStrokeColorByElement = (board: PlaitBoard, element: PlaitGeometry | PlaitLine) => {
    const strokeColor = element.strokeColor || DefaultGeometryStyle.strokeColor;
    return strokeColor;
};
