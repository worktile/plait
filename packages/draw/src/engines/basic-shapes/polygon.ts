import {
    PlaitBoard,
    PlaitElement,
    Point,
    PointOfRectangle,
    RectangleClient,
    distanceBetweenPointAndPoint,
    getNearestPointBetweenPointAndSegments,
    isPointInPolygon,
    setStrokeLinecap
} from '@plait/core';
import { ShapeEngine } from '../../interfaces';
import { Options } from 'roughjs/bin/core';
import { getCrossingPointBetweenPointAndPolygon, getPolygonEdgeByConnectionPoint } from '../../utils/polygon';

export interface CreateOptions {
    getPolygonPoints: (rectangle: RectangleClient) => Point[];
    getConnectorPoints?: (rectangle: RectangleClient) => Point[];
    getTextRectangle?: (element: PlaitElement) => RectangleClient;
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
        isInsidePoint(rectangle: RectangleClient, point: Point) {
            const points = getPoints(rectangle);
            return isPointInPolygon(point, points);
        },
        getCornerPoints(rectangle: RectangleClient) {
            return getPoints(rectangle);
        },
        getNearestPoint(rectangle: RectangleClient, point: Point) {
            return getNearestPointBetweenPointAndSegments(point, getPoints(rectangle));
        },
        getNearestCrossingPoint(rectangle: RectangleClient, point: Point) {
            const corners = getPoints(rectangle);
            const crossingPoints = getCrossingPointBetweenPointAndPolygon(corners, point);
            let nearestPoint = crossingPoints[0];
            let nearestDistance = distanceBetweenPointAndPoint(point[0], point[1], nearestPoint[0], nearestPoint[1]);
            crossingPoints
                .filter((v, index) => index > 0)
                .forEach(crossingPoint => {
                    let distance = distanceBetweenPointAndPoint(point[0], point[1], crossingPoint[0], crossingPoint[1]);
                    if (distance < nearestDistance) {
                        nearestDistance = distance;
                        nearestPoint = crossingPoint;
                    }
                });

            return nearestPoint;
        },
        getEdgeByConnectionPoint(rectangle: RectangleClient, pointOfRectangle: PointOfRectangle): [Point, Point] | null {
            const corners = getPoints(rectangle);
            const point = RectangleClient.getConnectionPoint(rectangle, pointOfRectangle);
            return getPolygonEdgeByConnectionPoint(corners, point);
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
