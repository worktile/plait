import { PlaitBoard, Point, RectangleClient, getNearestPointBetweenPointAndSegments, isPointInPolygon, setStrokeLinecap } from '@plait/core';
import { ShapeEngine } from '../../interfaces';
import { Options } from 'roughjs/bin/core';

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
    getNearestPoint(rectangle: RectangleClient, point: Point) {
        const connectorPoints = RectangleClient.getEdgeCenterPoints(rectangle);
        return getNearestPointBetweenPointAndSegments(point, connectorPoints);
    },
    getConnectorPoints(rectangle: RectangleClient) {
        return RectangleClient.getEdgeCenterPoints(rectangle);
    }
};
