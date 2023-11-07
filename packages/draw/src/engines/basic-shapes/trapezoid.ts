import {
    PlaitBoard,
    Point,
    PointOfRectangle,
    RectangleClient,
    getNearestPointBetweenPointAndSegments,
    isPointInPolygon,
    setStrokeLinecap
} from '@plait/core';
import { ShapeEngine } from '../../interfaces';
import { Options } from 'roughjs/bin/core';
import { getCenterPointsOnPolygon, getEdgeOnPolygonByPoint } from '../../utils/geometry';
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
    }
});
