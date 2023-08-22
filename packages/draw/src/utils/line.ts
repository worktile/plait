import { Point, RectangleClient, XYPosition, idCreator } from '@plait/core';
import { LineHandle, LineShape, PlaitLine } from '../interfaces';
import { FlowPosition, getPoints } from '@plait/flow';

export const createLineElement = (
    shape: LineShape,
    points: [Point, Point],
    source: LineHandle,
    target: LineHandle,
    options?: Pick<PlaitLine, 'strokeColor' | 'strokeWidth'>
): PlaitLine => {
    return {
        id: idCreator(),
        type: 'line',
        shape,
        source,
        target,
        opacity: 1,
        points,
        ...options
    };
};

export const getElbowPoints = (element: PlaitLine) => {
    if (element.points.length === 2) {
        const points: Point[] = [];
        const XYPoints = getPoints({
            source: {
                x: element.points[0][0],
                y: element.points[0][1]
            },
            sourcePosition: FlowPosition.right,
            target: {
                x: element.points[1][0],
                y: element.points[1][1]
            },
            targetPosition: FlowPosition.left,
            center: {
                x: element.points[1][0],
                y: element.points[1][1]
            },
            offset: 0
        });
        XYPoints[0].forEach((position: XYPosition) => {
            points.push([position.x, position.y]);
        });
        return points;
    }
    return element.points;
};

export const isHitPolyLine = (pathPoints: Point[], point: Point, strokeWidth: number, expand: number = 0) => {
    const nearestPoint = polyLineNearestPoint(pathPoints, point);
    const distance = Math.hypot(nearestPoint[0] - point[0], nearestPoint[1] - point[1]);
    return distance <= strokeWidth + expand;
};

export function polyLineNearestPoint(points: Point[], point: Point) {
    const len = points.length;
    let result: Point = points[0];
    let distance = Infinity;
    for (let i = 0; i < len - 1; i++) {
        const p = points[i];
        const p2 = points[i + 1];
        const temp = getNearestPointOnLine([p, p2], point);
        const currentDistance = Math.hypot(temp[1] - point[1], temp[0] - point[0]);
        if (currentDistance < distance) {
            distance = currentDistance;
            result = temp;
        }
    }
    return result;
}

export const getNearestPointOnLine = (linePoints: [Point, Point], point: Point): Point => {
    const A = { x: linePoints[0][0], y: linePoints[0][1] };
    const B = { x: linePoints[1][0], y: linePoints[1][1] };
    const P = { x: point[0], y: point[1] };
    const AB = { x: B.x - A.x, y: B.y - A.y };
    const AP = { x: P.x - A.x, y: P.y - A.y };
    const dotProduct = AB.x * AP.x + AB.y * AP.y;
    const squaredLengthAB = AB.x * AB.x + AB.y * AB.y;

    const t = dotProduct / squaredLengthAB;

    if (t < 0) {
        return [A.x, A.y];
    } else if (t > 1) {
        return [B.x, B.y];
    } else {
        const Q = { x: A.x + t * AB.x, y: A.y + t * AB.y };
        return [Q.x, Q.y];
    }
};

export const isLinesIntersect = (a: Point, b: Point, c: Point, d: Point): boolean => {
    const crossProduct = (v1: Point, v2: Point) => v1[0] * v2[1] - v1[1] * v2[0];

    const ab: Point = [b[0] - a[0], b[1] - a[1]];
    const ac: Point = [c[0] - a[0], c[1] - a[1]];
    const ad: Point = [d[0] - a[0], d[1] - a[1]];

    const ca: Point = [a[0] - c[0], a[1] - c[1]];
    const cb: Point = [b[0] - c[0], b[1] - c[1]];
    const cd: Point = [d[0] - c[0], d[1] - c[1]];

    return crossProduct(ab, ac) * crossProduct(ab, ad) <= 0 && crossProduct(cd, ca) * crossProduct(cd, cb) <= 0;
};

export const isPolyLineIntersectWithRectangle = (points: Point[], rectangle: RectangleClient) => {
    const leftTopPoint: Point = [rectangle.x, rectangle.y];
    const rightTopPoint: Point = [rectangle.x + rectangle.width, rectangle.y];
    const leftBottomPoint: Point = [rectangle.x, rectangle.y + rectangle.height];
    const rightBottomPoint: Point = [rectangle.x + rectangle.width, rectangle.y + rectangle.height];

    for (let i = 1; i < points.length; i++) {
        const isIntersect =
            isLinesIntersect(points[i], points[i - 1], leftTopPoint, rightTopPoint) ||
            isLinesIntersect(points[i], points[i - 1], rightTopPoint, leftBottomPoint) ||
            isLinesIntersect(points[i], points[i - 1], leftBottomPoint, rightBottomPoint) ||
            isLinesIntersect(points[i], points[i - 1], rightBottomPoint, leftTopPoint);
        if (isIntersect) return true;
    }

    return false;
};
