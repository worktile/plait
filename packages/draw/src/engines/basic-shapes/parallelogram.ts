import { PlaitBoard, Point, RectangleClient } from '@plait/core';
import { PlaitGeometry, ShapeEngine } from '../../interfaces';
import { createPolygonEngine } from './polygon';
import { getCenterPointsOnPolygon } from '../../utils/polygon';
import { getCustomTextRectangle } from '../../utils';

export const getParallelogramPoints = (rectangle: RectangleClient): Point[] => {
    return [
        [rectangle.x + rectangle.width / 4, rectangle.y],
        [rectangle.x + rectangle.width, rectangle.y],
        [rectangle.x + (rectangle.width * 3) / 4, rectangle.y + rectangle.height],
        [rectangle.x, rectangle.y + rectangle.height]
    ];
};
export const ParallelogramEngine: ShapeEngine = createPolygonEngine({
    getPolygonPoints: getParallelogramPoints,
    getConnectorPoints: (rectangle: RectangleClient) => {
        const cornerPoints = getParallelogramPoints(rectangle);
        return getCenterPointsOnPolygon(cornerPoints);
    },
    getTextRectangle: (board: PlaitBoard, element: PlaitGeometry) => {
        return getCustomTextRectangle(board, element, 1 / 2);
    }
});
