import { PlaitBoard, Point, RectangleClient } from '@plait/core';
import { PlaitGeometry, ShapeEngine } from '../../interfaces';
import { createPolygonEngine } from '../basic-shapes/polygon';
import { getCenterPointsOnPolygon } from '../../utils/polygon';
import { getCustomTextRectangle, getTextRectangle } from '../../utils';

export const getManualLoopPoints = (rectangle: RectangleClient): Point[] => {
    return [
        [rectangle.x, rectangle.y],
        [rectangle.x + rectangle.width, rectangle.y],
        [rectangle.x + (rectangle.width * 7) / 8, rectangle.y + rectangle.height],
        [rectangle.x + rectangle.width / 8, rectangle.y + rectangle.height]
    ];
};
export const ManualLoopEngine: ShapeEngine = createPolygonEngine({
    getPolygonPoints: getManualLoopPoints,
    getConnectorPoints: (rectangle: RectangleClient) => {
        const cornerPoints = getManualLoopPoints(rectangle);
        return getCenterPointsOnPolygon(cornerPoints);
    },
    getTextRectangle: (board: PlaitBoard, element: PlaitGeometry) => {
        const rectangle = getCustomTextRectangle(board, element, 3 / 4);
        return rectangle;
    }
});
