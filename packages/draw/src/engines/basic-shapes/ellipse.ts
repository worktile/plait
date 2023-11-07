import { PlaitBoard, Point, PointOfRectangle, RectangleClient, Vector, isPointInEllipse } from '@plait/core';
import { ShapeEngine } from '../../interfaces';
import { Options } from 'roughjs/bin/core';

export const EllipseEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        const centerPoint = [rectangle.x + rectangle.width / 2, rectangle.y + rectangle.height / 2];
        const rs = PlaitBoard.getRoughSVG(board);
        return rs.ellipse(centerPoint[0], centerPoint[1], rectangle.width, rectangle.height, { ...options, fillStyle: 'solid' });
    },
    isHit(rectangle: RectangleClient, point: Point) {
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
        const slope = getTangentSlope(point[0], point[1], a, b) as any;
        return getVectorBySlope(point[0], point[1], slope);
    },
    getConnectorPoints(rectangle: RectangleClient) {
        return RectangleClient.getEdgeCenterPoints(rectangle);
    }
};

export function getNearestPointBetweenPointAndEllipse(point: Point, center: Point, rx: number, ry: number, rotation: number = 0): Point {
    const rectangleClient = {
        x: center[0] - rx,
        y: center[1] - ry,
        height: ry * 2,
        width: rx * 2
    };
    // https://stackoverflow.com/a/46007540/232122
    const px = Math.abs(point[0] - rectangleClient.x - rectangleClient.width / 2);
    const py = Math.abs(point[1] - rectangleClient.y - rectangleClient.height / 2);

    let tx = 0.707;
    let ty = 0.707;

    const a = Math.abs(rectangleClient.width) / 2;
    const b = Math.abs(rectangleClient.height) / 2;

    [0, 1, 2, 3].forEach(x => {
        const xx = a * tx;
        const yy = b * ty;

        const ex = ((a * a - b * b) * tx ** 3) / a;
        const ey = ((b * b - a * a) * ty ** 3) / b;

        const rx = xx - ex;
        const ry = yy - ey;

        const qx = px - ex;
        const qy = py - ey;

        const r = Math.hypot(ry, rx);
        const q = Math.hypot(qy, qx);

        tx = Math.min(1, Math.max(0, ((qx * r) / q + ex) / a));
        ty = Math.min(1, Math.max(0, ((qy * r) / q + ey) / b));
        const t = Math.hypot(ty, tx);
        tx /= t;
        ty /= t;
    });
    const signX = point[0] > center[0] ? 1 : -1;
    const signY = point[1] > center[1] ? 1 : -1;

    return [center[0] + a * tx * signX, center[1] + b * ty * signY];
}

/**
 * the result of slope is based on Cartesian coordinate system
 * x, y are based on the position in the Cartesian coordinate system
 */
export function getTangentSlope(x: number, y: number, a: number, b: number) {
    const k = (-b * b * x) / (a * a * y);
    return k;
}

/**
 * x, y are based on the position in the Cartesian coordinate system
 */
export function getVectorBySlope(x: number, y: number, slope: number) {
    const deltaX = 30;
    const deltaY = -slope * deltaX;
    let start = [0 - deltaX, 0 - deltaY] as Point;
    let end = [0 + deltaX, 0 + deltaY] as Point;
    // y < 0 acts on the lower half of the x-axis, with the starting point at the top and the end point at the bottom.
    
    if (y < 0) {
        const temp = start;
        start = end;
        end = temp;
    }
    const vector = [end[0] - start[0], end[1] - start[1]] as Vector;
    return vector;
}
