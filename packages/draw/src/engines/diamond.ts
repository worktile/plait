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
import { getEdgeOnPolygonByPoint } from '../utils/geometry';

export const DiamondEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        const points = RectangleClient.getEdgeCenterPoints(rectangle);
        const rs = PlaitBoard.getRoughSVG(board);
        const polygon = rs.polygon(points, { ...options, fillStyle: 'solid' });
        setStrokeLinecap(polygon, 'round');
        return polygon;
    },
    isHit(rectangle: RectangleClient, point: Point) {
        const controlPoints = RectangleClient.getEdgeCenterPoints(rectangle);
        return isPointInPolygon(point, controlPoints);
    },
    getCornerPoints(rectangle: RectangleClient) {
        return RectangleClient.getEdgeCenterPoints(rectangle);
    },
    getNearestPoint(rectangle: RectangleClient, point: Point) {
        return getNearestPointBetweenPointAndSegments(point, DiamondEngine.getCornerPoints(rectangle));
    },
    getEdgeByConnectionPoint(rectangle: RectangleClient, pointOfRectangle: PointOfRectangle): [Point, Point] | null {
        const corners = DiamondEngine.getCornerPoints(rectangle);
        const point = RectangleClient.getConnectionPoint(rectangle, pointOfRectangle);
        return getEdgeOnPolygonByPoint(corners, point);
    },
    getConnectorPoints(rectangle: RectangleClient) {
        return RectangleClient.getEdgeCenterPoints(rectangle);
    }
};
