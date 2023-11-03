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
import { getCenterPointsOnPolygon, getEdgeOnPolygonByPoint } from '../../utils/geometry';
import { Options } from 'roughjs/bin/core';

export const StarEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        const points = getStarPoints(rectangle);
        const rs = PlaitBoard.getRoughSVG(board);
        const polygon = rs.polygon(points, { ...options, fillStyle: 'solid' });
        setStrokeLinecap(polygon, 'round');
        return polygon;
    },
    isHit(rectangle: RectangleClient, point: Point) {
        const parallelogramPoints = getStarPoints(rectangle);
        return isPointInPolygon(point, parallelogramPoints);
    },
    getCornerPoints(rectangle: RectangleClient) {
        return getStarPoints(rectangle);
    },
    getNearestPoint(rectangle: RectangleClient, point: Point) {
        return getNearestPointBetweenPointAndSegments(point, getStarPoints(rectangle));
    },
    getEdgeByConnectionPoint(rectangle: RectangleClient, pointOfRectangle: PointOfRectangle): [Point, Point] | null {
        const corners = getStarPoints(rectangle);
        const point = RectangleClient.getConnectionPoint(rectangle, pointOfRectangle);
        return getEdgeOnPolygonByPoint(corners, point);
    },
    getConnectorPoints(rectangle: RectangleClient) {
        const points = getStarPoints(rectangle);
        return [points[1], points[3], points[5], points[7], points[9]];
    }
};

export const getStarPoints = (rectangle: RectangleClient): Point[] => {
    return [
        [rectangle.x + rectangle.width / 2, rectangle.y + (rectangle.height * 75) / 91],
        [rectangle.x + (rectangle.width * 18.61) / 96, rectangle.y + rectangle.height],
        [rectangle.x + (rectangle.width * 24.2235871) / 96, rectangle.y + (rectangle.height * 57.7254249) / 91],
        [rectangle.x, rectangle.y + (rectangle.height * 34.5491503) / 91],
        [rectangle.x + (rectangle.width * 33.3053687) / 96, rectangle.y + (rectangle.height * 29.7745751) / 91],
        [rectangle.x + rectangle.width / 2, rectangle.y],
        [rectangle.x + (rectangle.width * 62.6946313) / 96, rectangle.y + (rectangle.height * 29.7745751) / 91],
        [rectangle.x + rectangle.width, rectangle.y + (rectangle.height * 34.5491503) / 91],
        [rectangle.x + (rectangle.width * 71.7764129) / 96, rectangle.y + (rectangle.height * 57.7254249) / 91],
        [rectangle.x + (rectangle.width * 77.3892626) / 96, rectangle.y + rectangle.height]
    ];
};
