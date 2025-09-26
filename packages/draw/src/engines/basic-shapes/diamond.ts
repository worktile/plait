import { PlaitBoard, RectangleClient } from '@plait/core';
import { PlaitGeometry, ShapeEngine } from '../../interfaces';
import { createPolygonEngine } from './polygon';
import { getCustomTextRectangle, getStrokeWidthByElement, getTextRectangle } from '../../utils';
import { ShapeDefaultSpace } from '../../constants/geometry';
import { getTextSize } from '../../utils/text-size';

export const DiamondEngine: ShapeEngine = createPolygonEngine({
    getPolygonPoints: RectangleClient.getEdgeCenterPoints,
    getConnectorPoints(rectangle: RectangleClient) {
        return RectangleClient.getEdgeCenterPoints(rectangle);
    },
    getTextRectangle: (board: PlaitBoard, element: PlaitGeometry) => {
        return getCustomTextRectangle(board, element, 1 / 2);
    }
});
