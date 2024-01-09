import {
    PlaitBoard,
    Point,
    PointOfRectangle,
    RectangleClient,
    getNearestPointBetweenPointAndSegments,
    isPointInPolygon,
    setStrokeLinecap
} from '@plait/core';
import { PlaitGeometry, ShapeEngine } from '../../interfaces';
import { Options } from 'roughjs/bin/core';
import { getCenterPointsOnPolygon, getPolygonEdgeByConnectionPoint, getTextRectangle } from '../../utils/geometry';
import { createPolygonEngine } from './polygon';

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
    getTextRectangle(element: PlaitGeometry) {
        const rectangle = getTextRectangle(element);
        const width = rectangle.width;
        rectangle.width = (rectangle.width * 3) / 4;
        rectangle.x += width / 8;
        return rectangle;
    }
});
