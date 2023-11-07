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

export const ManualLoopEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        const points = getManualLoopPoints(rectangle);
        const rs = PlaitBoard.getRoughSVG(board);
        const polygon = rs.polygon(points, { ...options, fillStyle: 'solid' });
        setStrokeLinecap(polygon, 'round');
        return polygon;
    },
    isHit(rectangle: RectangleClient, point: Point) {
        const points = getManualLoopPoints(rectangle);
        return isPointInPolygon(point, points);
    },
    getNearestPoint(rectangle: RectangleClient, point: Point) {
        const cornerPoints = getManualLoopPoints(rectangle);
        return getNearestPointBetweenPointAndSegments(point, cornerPoints);
    },
    getConnectorPoints(rectangle: RectangleClient) {
        const cornerPoints = getManualLoopPoints(rectangle);
        const lineCenterPoints = getCenterPointsOnPolygon(cornerPoints);
        return lineCenterPoints;
    },
    getEdgeByConnectionPoint(rectangle: RectangleClient, pointOfRectangle: PointOfRectangle): [Point, Point] | null {
        const corners = getManualLoopPoints(rectangle);
        const point = RectangleClient.getConnectionPoint(rectangle, pointOfRectangle);
        return getEdgeOnPolygonByPoint(corners, point);
    },
    getCornerPoints(rectangle: RectangleClient) {
        return getManualLoopPoints(rectangle);
    }
};

export const getManualLoopPoints = (rectangle: RectangleClient): Point[] => {
    return [
        [rectangle.x, rectangle.y],
        [rectangle.x + rectangle.width, rectangle.y],
        [rectangle.x + (rectangle.width * 7) / 8, rectangle.y + rectangle.height],
        [rectangle.x + rectangle.width / 8, rectangle.y + rectangle.height]
    ];
};
