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
import { getEdgeOnPolygonByPoint } from '../utils/geometry';
import { Options } from 'roughjs/bin/core';

export const OctagonEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        const points = getOctagonPoints(rectangle);
        const rs = PlaitBoard.getRoughSVG(board);
        const polygon = rs.polygon(points, { ...options, fillStyle: 'solid' });
        setStrokeLinecap(polygon, 'round');
        return polygon;
    },
    isHit(rectangle: RectangleClient, point: Point) {
        const parallelogramPoints = getOctagonPoints(rectangle);
        return isPointInPolygon(point, parallelogramPoints);
    },
    getCornerPoints(rectangle: RectangleClient) {
        return getOctagonPoints(rectangle);
    },
    getNearestPoint(rectangle: RectangleClient, point: Point) {
        return getNearestPointBetweenPointAndSegments(point, getOctagonPoints(rectangle));
    },
    getEdgeByConnectionPoint(rectangle: RectangleClient, pointOfRectangle: PointOfRectangle): [Point, Point] | null {
        const corners = getOctagonPoints(rectangle);
        const point = RectangleClient.getConnectionPoint(rectangle, pointOfRectangle);
        return getEdgeOnPolygonByPoint(corners, point);
    },
    getConnectorPoints(rectangle: RectangleClient) {
        return RectangleClient.getEdgeCenterPoints(rectangle);
    }
};

export const getOctagonPoints = (rectangle: RectangleClient): Point[] => {
    return [
        [rectangle.x + (rectangle.width * 3) / 10, rectangle.y],
        [rectangle.x + (rectangle.width * 7) / 10, rectangle.y],
        [rectangle.x + rectangle.width, rectangle.y + (rectangle.height * 3) / 10],
        [rectangle.x + rectangle.width, rectangle.y + (rectangle.height * 7) / 10],
        [rectangle.x + (rectangle.width * 7) / 10, rectangle.y + rectangle.height],
        [rectangle.x + (rectangle.width * 3) / 10, rectangle.y + rectangle.height],
        [rectangle.x, rectangle.y + (rectangle.height * 7) / 10],
        [rectangle.x, rectangle.y + (rectangle.height * 3) / 10]
    ];
};
