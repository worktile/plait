import {
    PlaitBoard,
    Point,
    PointOfRectangle,
    RectangleClient,
    getEllipseTangentSlope,
    getVectorFromPointAndSlope,
    isPointInEllipse,
    getNearestPointBetweenPointAndEllipse,
    setStrokeLinecap
} from '@plait/core';
import { PlaitGeometry, ShapeEngine } from '../../interfaces';
import { Options } from 'roughjs/bin/core';
import { getTextRectangle } from '../../utils';

export interface CreateEllipseOptions {
    draw?: (board: PlaitBoard, rectangle: RectangleClient, options: Options) => SVGGElement;
    getTextRectangle?: (element: PlaitGeometry) => RectangleClient;
}

export function createEllipseEngine(createOptions?: CreateEllipseOptions): ShapeEngine {
    const engine: ShapeEngine = {
        draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
            const centerPoint = [rectangle.x + rectangle.width / 2, rectangle.y + rectangle.height / 2];
            const rs = PlaitBoard.getRoughSVG(board);
            const shape = rs.ellipse(centerPoint[0], centerPoint[1], rectangle.width, rectangle.height, { ...options, fillStyle: 'solid' });
            setStrokeLinecap(shape, 'round');
            return shape;
        },
        isInsidePoint(rectangle: RectangleClient, point: Point) {
            const centerPoint: Point = [rectangle.x + rectangle.width / 2, rectangle.y + rectangle.height / 2];
            return isPointInEllipse(point, centerPoint, rectangle.width / 2, rectangle.height / 2);
        },
        getCornerPoints(rectangle: RectangleClient) {
            return RectangleClient.getEdgeCenterPoints(rectangle);
        },
        getNearestPoint(rectangle: RectangleClient, point: Point) {
            const centerPoint: Point = [rectangle.x + rectangle.width / 2, rectangle.y + rectangle.height / 2];
            return getNearestPointBetweenPointAndEllipse(point, centerPoint, rectangle.width / 2, rectangle.height / 2);
        },
        getTangentVectorByConnectionPoint(rectangle: RectangleClient, pointOfRectangle: PointOfRectangle) {
            const connectionPoint = RectangleClient.getConnectionPoint(rectangle, pointOfRectangle);
            const centerPoint: Point = [rectangle.x + rectangle.width / 2, rectangle.y + rectangle.height / 2];
            const point = [connectionPoint[0] - centerPoint[0], -(connectionPoint[1] - centerPoint[1])];
            const a = rectangle.width / 2;
            const b = rectangle.height / 2;
            const slope = getEllipseTangentSlope(point[0], point[1], a, b) as any;
            const vector = getVectorFromPointAndSlope(point[0], point[1], slope);
            return vector;
        },
        getConnectorPoints(rectangle: RectangleClient) {
            return RectangleClient.getEdgeCenterPoints(rectangle);
        },
        getTextRectangle(element: PlaitGeometry) {
            const rectangle = getTextRectangle(element);
            const width = rectangle.width;
            rectangle.width = (rectangle.width * 3) / 4;
            rectangle.x += width / 8;
            return rectangle;
        }
    };

    if (createOptions?.draw) {
        engine.draw = createOptions.draw;
    }
    if (createOptions?.getTextRectangle) {
        engine.getTextRectangle = createOptions.getTextRectangle;
    }

    return engine;
}

export const EllipseEngine: ShapeEngine = createEllipseEngine();
