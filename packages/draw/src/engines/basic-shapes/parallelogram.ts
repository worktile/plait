import { Point, RectangleClient } from '@plait/core';
import { ShapeEngine } from '../../interfaces';
import { getCenterPointsOnPolygon } from '../../utils/geometry';
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
    }
});
