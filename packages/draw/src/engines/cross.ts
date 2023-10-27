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

export const CrossEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        const points = getCrossPoints(rectangle);
        const rs = PlaitBoard.getRoughSVG(board);
        const polygon = rs.polygon(points, { ...options, fillStyle: 'solid' });
        setStrokeLinecap(polygon, 'round');
        return polygon;
    },
    isHit(rectangle: RectangleClient, point: Point) {
        const parallelogramPoints = getCrossPoints(rectangle);
        return isPointInPolygon(point, parallelogramPoints);
    },
    getCornerPoints(rectangle: RectangleClient) {
        return getCrossPoints(rectangle);
    },
    getNearestPoint(rectangle: RectangleClient, point: Point) {
        return getNearestPointBetweenPointAndSegments(point, getCrossPoints(rectangle));
    },
    getEdgeByConnectionPoint(rectangle: RectangleClient, pointOfRectangle: PointOfRectangle): [Point, Point] | null {
        const corners = getCrossPoints(rectangle);
        const point = RectangleClient.getConnectionPoint(rectangle, pointOfRectangle);
        return getEdgeOnPolygonByPoint(corners, point);
    },
    getConnectorPoints(rectangle: RectangleClient) {
        return RectangleClient.getEdgeCenterPoints(rectangle);
    }
};

export const getCrossPoints = (rectangle: RectangleClient): Point[] => {
    return [
        [rectangle.x + rectangle.width / 4, rectangle.y],
        [rectangle.x + (rectangle.width * 3) / 4, rectangle.y],
        [rectangle.x + (rectangle.width * 3) / 4, rectangle.y + rectangle.height / 4],
        [rectangle.x + rectangle.width, rectangle.y + rectangle.height / 4],
        [rectangle.x + rectangle.width, rectangle.y + (rectangle.height * 3) / 4],
        [rectangle.x + (rectangle.width * 3) / 4, rectangle.y + (rectangle.height * 3) / 4],
        [rectangle.x + (rectangle.width * 3) / 4, rectangle.y + rectangle.height],
        [rectangle.x + rectangle.width / 4, rectangle.y + rectangle.height],
        [rectangle.x + rectangle.width / 4, rectangle.y + (rectangle.height * 3) / 4],
        [rectangle.x, rectangle.y + (rectangle.height * 3) / 4],
        [rectangle.x, rectangle.y + rectangle.height / 4],
        [rectangle.x + rectangle.width / 4, rectangle.y + rectangle.height / 4]
    ];
};
