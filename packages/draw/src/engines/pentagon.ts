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

export const PentagonEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        const points = getPentagonPoints(rectangle);
        const rs = PlaitBoard.getRoughSVG(board);
        const polygon = rs.polygon(points, { ...options, fillStyle: 'solid' });
        setStrokeLinecap(polygon, 'round');
        return polygon;
    },
    isHit(rectangle: RectangleClient, point: Point) {
        const parallelogramPoints = getPentagonPoints(rectangle);
        return isPointInPolygon(point, parallelogramPoints);
    },
    getCornerPoints(rectangle: RectangleClient) {
        return getPentagonPoints(rectangle);
    },
    getNearestPoint(rectangle: RectangleClient, point: Point) {
        return getNearestPointBetweenPointAndSegments(point, getPentagonPoints(rectangle));
    },
    getEdgeByConnectionPoint(rectangle: RectangleClient, pointOfRectangle: PointOfRectangle): [Point, Point] | null {
        const corners = getPentagonPoints(rectangle);
        const point = RectangleClient.getConnectionPoint(rectangle, pointOfRectangle);
        return getEdgeOnPolygonByPoint(corners, point);
    },
    getConnectorPoints(rectangle: RectangleClient) {
        return getPentagonPoints(rectangle);
    }
};

export const getPentagonPoints = (rectangle: RectangleClient): Point[] => {
    return [
        [rectangle.x + rectangle.width / 2, rectangle.y],
        [rectangle.x + rectangle.width, rectangle.y + (rectangle.height * 2) / 5],
        [rectangle.x + (rectangle.width * 4) / 5, rectangle.y + rectangle.height],
        [rectangle.x + rectangle.width / 5, rectangle.y + rectangle.height],
        [rectangle.x, rectangle.y + (rectangle.height * 2) / 5]
    ];
};
