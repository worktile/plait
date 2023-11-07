import {
    PlaitBoard,
    Point,
    PointOfRectangle,
    RectangleClient,
    getNearestPointBetweenPointAndSegments,
    isPointInPolygon,
    setStrokeLinecap
} from '@plait/core';
import { getEdgeOnPolygonByPoint } from '../../utils';
import { PlaitGeometry, ShapeEngine } from '../../interfaces';
import { Options } from 'roughjs/bin/core';

export interface CreateOptions {
    getPolygonPoints: (rectangle: RectangleClient) => Point[];
    getConnectorPoints?: (rectangle: RectangleClient) => Point[];
    getTextRectangle?: (element: PlaitGeometry) => RectangleClient;
}

export function createPolygonEngine(options: CreateOptions): ShapeEngine {
    const getPoints = options.getPolygonPoints;
    const engine: ShapeEngine = {
        draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
            const points = getPoints(rectangle);
            const rs = PlaitBoard.getRoughSVG(board);
            const polygon = rs.polygon(points, { ...options, fillStyle: 'solid' });
            setStrokeLinecap(polygon, 'round');
            return polygon;
        },
        isHit(rectangle: RectangleClient, point: Point) {
            const points = getPoints(rectangle);
            return isPointInPolygon(point, points);
        },
        getCornerPoints(rectangle: RectangleClient) {
            return getPoints(rectangle);
        },
        getNearestPoint(rectangle: RectangleClient, point: Point) {
            return getNearestPointBetweenPointAndSegments(point, getPoints(rectangle));
        },
        getEdgeByConnectionPoint(rectangle: RectangleClient, pointOfRectangle: PointOfRectangle): [Point, Point] | null {
            const corners = getPoints(rectangle);
            const point = RectangleClient.getConnectionPoint(rectangle, pointOfRectangle);
            return getEdgeOnPolygonByPoint(corners, point);
        },
        getConnectorPoints(rectangle: RectangleClient) {
            if (options.getConnectorPoints) {
                return options.getConnectorPoints(rectangle);
            }
            return getPoints(rectangle);
        }
    };
    if (options.getTextRectangle) {
        engine.getTextRectangle = options.getTextRectangle;
    }
    return engine;
}
