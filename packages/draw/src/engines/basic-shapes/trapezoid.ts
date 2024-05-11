import { Point, RectangleClient } from '@plait/core';
import { PlaitGeometry, GeometryEngine } from '../../interfaces';
import { createPolygonEngine } from './polygon';
import { getCenterPointsOnPolygon } from '../../utils/polygon';
import { getTextRectangle } from '../../utils';

export const getTrapezoidPoints = (rectangle: RectangleClient): Point[] => {
    return [
        [rectangle.x + rectangle.width * 0.15, rectangle.y],
        [rectangle.x + rectangle.width * 0.85, rectangle.y],
        [rectangle.x + rectangle.width, rectangle.y + rectangle.height],
        [rectangle.x, rectangle.y + rectangle.height]
    ];
};

export const TrapezoidEngine: GeometryEngine = createPolygonEngine({
    getPolygonPoints: getTrapezoidPoints,
    getConnectorPoints(rectangle: RectangleClient) {
        const points = getTrapezoidPoints(rectangle);
        return getCenterPointsOnPolygon(points);
    },
    getTextRectangle(element: PlaitGeometry) {
        const rectangle = getTextRectangle(element);
        const width = rectangle.width;
        rectangle.width = (rectangle.width * 3) / 4;
        rectangle.x += width / 8;
        return rectangle;
    }
});
