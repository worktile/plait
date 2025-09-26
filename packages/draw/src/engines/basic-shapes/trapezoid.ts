import { PlaitBoard, Point, RectangleClient } from '@plait/core';
import { PlaitGeometry, ShapeEngine } from '../../interfaces';
import { createPolygonEngine } from './polygon';
import { getCenterPointsOnPolygon } from '../../utils/polygon';
import { getCustomTextRectangle } from '../../utils';

export const getTrapezoidPoints = (rectangle: RectangleClient): Point[] => {
    return [
        [rectangle.x + rectangle.width * 0.15, rectangle.y],
        [rectangle.x + rectangle.width * 0.85, rectangle.y],
        [rectangle.x + rectangle.width, rectangle.y + rectangle.height],
        [rectangle.x, rectangle.y + rectangle.height]
    ];
};

export const TrapezoidEngine: ShapeEngine = createPolygonEngine({
    getPolygonPoints: getTrapezoidPoints,
    getConnectorPoints(rectangle: RectangleClient) {
        const points = getTrapezoidPoints(rectangle);
        return getCenterPointsOnPolygon(points);
    },
    getTextRectangle(board: PlaitBoard, element: PlaitGeometry) {
        return getCustomTextRectangle(board, element, 3 / 4);
    }
});
