import {
    PlaitBoard,
    Point,
    PointOfRectangle,
    RectangleClient,
    getNearestPointBetweenPointAndSegments,
    isPointInPolygon,
    setStrokeLinecap
} from '@plait/core';
import { ShapeEngine } from '../interfaces';
import { getCenterPointsOnPolygon, getEdgeOnPolygonByPoint } from '../utils/geometry';
import { Options } from 'roughjs/bin/core';

export const ParallelogramEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        const points = getParallelogramCornerPoints(rectangle);
        const rs = PlaitBoard.getRoughSVG(board);
        const polygon = rs.polygon(points, { ...options, fillStyle: 'solid' });
        setStrokeLinecap(polygon, 'round');
        return polygon;
    },
    isHit(rectangle: RectangleClient, point: Point) {
        const parallelogramPoints = getParallelogramCornerPoints(rectangle);
        return isPointInPolygon(point, parallelogramPoints);
    },
    getCornerPoints(rectangle: RectangleClient) {
        return getParallelogramCornerPoints(rectangle);
    },
    getNearestPoint(rectangle: RectangleClient, point: Point) {
        return getNearestPointBetweenPointAndSegments(point, ParallelogramEngine.getCornerPoints(rectangle));
    },
    getEdgeByConnectionPoint(rectangle: RectangleClient, pointOfRectangle: PointOfRectangle): [Point, Point] | null {
        const corners = getParallelogramCornerPoints(rectangle);
        const point = RectangleClient.getConnectionPoint(rectangle, pointOfRectangle);
        return getEdgeOnPolygonByPoint(corners, point);
    },
    getConnectorPoints(rectangle: RectangleClient) {
        const cornerPoints = getParallelogramCornerPoints(rectangle);
        return getCenterPointsOnPolygon(cornerPoints);
    }
};

export const getParallelogramCornerPoints = (rectangle: RectangleClient): Point[] => {
    return [
        [rectangle.x + rectangle.width / 4, rectangle.y],
        [rectangle.x + rectangle.width, rectangle.y],
        [rectangle.x + (rectangle.width * 3) / 4, rectangle.y + rectangle.height],
        [rectangle.x, rectangle.y + rectangle.height]
    ];
};
