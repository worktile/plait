import { PlaitBoard, Point, RectangleClient, getNearestPointBetweenPointAndSegments, isPointInPolygon } from '@plait/core';
import { ShapeMethods } from '../../interfaces';
import { drawParallelogram, getCenterPointsOnPolygon, getParallelogramPoints } from '../geometry';
import { Options } from 'roughjs/bin/core';

export const ParallelogramMethods: ShapeMethods = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        return drawParallelogram(board, rectangle, options);
    },
    isHit(rectangle: RectangleClient, point: Point) {
        const parallelogramPoints = getParallelogramPoints(rectangle);
        return isPointInPolygon(point, parallelogramPoints);
    },
    getNearestPoint(rectangle: RectangleClient, point: Point) {
        const cornerPoints = getParallelogramPoints(rectangle);
        return getNearestPointBetweenPointAndSegments(point, cornerPoints);
    },
    getConnectorPoints(rectangle: RectangleClient) {
        const cornerPoints = getParallelogramPoints(rectangle);
        return getCenterPointsOnPolygon(cornerPoints);
    }
};
