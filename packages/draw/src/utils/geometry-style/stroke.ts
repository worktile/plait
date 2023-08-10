import { PlaitBoard } from '@plait/core';
import { PlaitGeometry } from '../../interfaces';
import { DefaultGeometryStyle } from '../../constants';

export const getStrokeWidthByElement = (board: PlaitBoard, element: PlaitGeometry) => {
    const strokeWidth = element.strokeWidth || DefaultGeometryStyle.strokeWidth;
    return strokeWidth;
};
