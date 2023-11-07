import { Point, RectangleClient } from '@plait/core';
import { ShapeEngine } from '../../interfaces';
import { createPolygonEngine } from './polygon';
import { getCenterPointsOnPolygon } from '../../utils';

export const getTrianglePoints = (rectangle: RectangleClient): Point[] => {
    return [
        [rectangle.x + rectangle.width / 2, rectangle.y],
        [rectangle.x + rectangle.width, rectangle.y + rectangle.height],
        [rectangle.x, rectangle.y + rectangle.height]
    ];
};

export const TriangleEngine: ShapeEngine = createPolygonEngine({
    getPolygonPoints: getTrianglePoints,
    getConnectorPoints(rectangle: RectangleClient) {
        const cornerPoints = getTrianglePoints(rectangle);
        const lineCenterPoints = getCenterPointsOnPolygon(cornerPoints);
        return [...lineCenterPoints, ...cornerPoints];
    }
});
