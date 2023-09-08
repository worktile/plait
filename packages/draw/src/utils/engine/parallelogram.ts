import { PlaitBoard, Point, RectangleClient, getNearestPointBetweenPointAndSegments, isPointInPolygon } from '@plait/core';
import { ShapeEngine } from '../../interfaces';
import { getCenterPointsOnPolygon } from '../geometry';
import { Options } from 'roughjs/bin/core';

export const ParallelogramEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        const points = getParallelogramPoints(rectangle);
        const rs = PlaitBoard.getRoughSVG(board);
        return rs.polygon(points, { ...options, fillStyle: 'solid' });
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

export const getParallelogramPoints = (rectangle: RectangleClient): Point[] => {
    return [
        [rectangle.x + rectangle.width / 4, rectangle.y],
        [rectangle.x + rectangle.width, rectangle.y],
        [rectangle.x + (rectangle.width * 3) / 4, rectangle.y + rectangle.height],
        [rectangle.x, rectangle.y + rectangle.height]
    ];
};
