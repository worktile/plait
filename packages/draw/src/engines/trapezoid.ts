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
import { Options } from 'roughjs/bin/core';
import { getCenterPointsOnPolygon, getEdgeOnPolygonByPoint } from '../utils/geometry';

export const TrapezoidEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        const points = getTrapezoidPoints(rectangle);
        const rs = PlaitBoard.getRoughSVG(board);
        const polygon = rs.polygon(points, { ...options, fillStyle: 'solid' });
        setStrokeLinecap(polygon, 'round');
        return polygon;
    },
    isHit(rectangle: RectangleClient, point: Point) {
        const points = getTrapezoidPoints(rectangle);
        return isPointInPolygon(point, points);
    },
    getNearestPoint(rectangle: RectangleClient, point: Point) {
        const cornerPoints = getTrapezoidPoints(rectangle);
        return getNearestPointBetweenPointAndSegments(point, cornerPoints);
    },
    getConnectorPoints(rectangle: RectangleClient) {
        const points = getTrapezoidPoints(rectangle);
        return getCenterPointsOnPolygon(points);
    },
    getEdgeByConnectionPoint(rectangle: RectangleClient, pointOfRectangle: PointOfRectangle): [Point, Point] | null {
        const corners = getTrapezoidPoints(rectangle);
        const point = RectangleClient.getConnectionPoint(rectangle, pointOfRectangle);
        return getEdgeOnPolygonByPoint(corners, point);
    },
    getCornerPoints(rectangle: RectangleClient) {
        return getTrapezoidPoints(rectangle);
    }
};

export const getTrapezoidPoints = (rectangle: RectangleClient): Point[] => {
    return [
        [rectangle.x + rectangle.width * 0.15, rectangle.y],
        [rectangle.x + rectangle.width * 0.85, rectangle.y],
        [rectangle.x + rectangle.width, rectangle.y + rectangle.height],
        [rectangle.x, rectangle.y + rectangle.height]
    ];
};
