import {
    PlaitBoard,
    Point,
    RectangleClient,
    getNearestPointBetweenPointAndSegments,
    isPointInPolygon,
    setStrokeLinecap
} from '@plait/core';
import { ShapeEngine } from '../../interfaces';
import { Options } from 'roughjs/bin/core';
import { getCenterPointsOnPolygon } from '../geometry';

export const TriangleEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        const points = getTrianglePoints(rectangle);
        const rs = PlaitBoard.getRoughSVG(board);
        const polygon = rs.polygon(points, { ...options, fillStyle: 'solid' });
        setStrokeLinecap(polygon, 'round');
        return polygon;
    },
    isHit(rectangle: RectangleClient, point: Point) {
        const points = getTrianglePoints(rectangle);
        return isPointInPolygon(point, points);
    },
    getNearestPoint(rectangle: RectangleClient, point: Point) {
        const cornerPoints = getTrianglePoints(rectangle);
        return getNearestPointBetweenPointAndSegments(point, cornerPoints);
    },
    getConnectorPoints(rectangle: RectangleClient) {
        const cornerPoints = getTrianglePoints(rectangle);
        const lineCenterPoints = getCenterPointsOnPolygon(cornerPoints);
        return [...lineCenterPoints, ...cornerPoints];
    },
    getCornerPoints(rectangle: RectangleClient) {
        return getTrianglePoints(rectangle);
    }
};

export const getTrianglePoints = (rectangle: RectangleClient): Point[] => {
    return [
        [rectangle.x + rectangle.width / 2, rectangle.y],
        [rectangle.x + rectangle.width, rectangle.y + rectangle.height],
        [rectangle.x, rectangle.y + rectangle.height]
    ];
};
