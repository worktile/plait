import { Point, RectangleClient } from '@plait/core';
import { PlaitGeometry, ShapeEngine } from '../../interfaces';
import { getCenterPointsOnPolygon, getTextRectangle } from '../../utils/geometry';
import { createPolygonEngine } from './polygon';

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
    getTextRectangle(element: PlaitGeometry) {
        const rectangle = getTextRectangle(element);
        const width = rectangle.width;
        rectangle.width = rectangle.width / 2;
        rectangle.x += width / 4;
        return rectangle;
    }
});
