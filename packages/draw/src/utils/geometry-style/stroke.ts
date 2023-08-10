import { PlaitBoard } from '@plait/core';
import { PlaitGeometry } from '../../interfaces';
import { DefaultGeometryStyle } from '../../constants';

export const getStrokeWidthByElement = (board: PlaitBoard, element: PlaitGeometry) => {
    const strokeWidth = element.strokeWidth || DefaultGeometryStyle.strokeWidth;
    return strokeWidth;
};

export const getStrokeColorByElement = (board: PlaitBoard, element: PlaitGeometry) => {
    const strokeColor = element.strokeColor || DefaultGeometryStyle.strokeColor;
    return strokeColor;
};
