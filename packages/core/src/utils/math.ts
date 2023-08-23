import { getHandleCenters } from '@plait/common';
import { Point } from '../interfaces';
import { RectangleClient } from '../interfaces/rectangle-client';

// https://stackoverflow.com/a/6853926/232122
export function distanceBetweenPointAndSegment(x: number, y: number, x1: number, y1: number, x2: number, y2: number) {
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSquare = C * C + D * D;
    let param = -1;
    if (lenSquare !== 0) {
        // in case of 0 length line
        param = dot / lenSquare;
    }

    let xx, yy;
    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;
    return Math.hypot(dx, dy);
}

export function polyLineNearestDistance(points: Point[], point: Point) {
    const len = points.length;
    let distance = Infinity;
    for (let i = 0; i < len - 1; i++) {
        const p = points[i];
        const p2 = points[i + 1];
        const currentDistance = distanceBetweenPointAndSegment(point[0], point[1], p[0], p[1], p2[0], p2[1]);
        if (currentDistance < distance) {
            distance = currentDistance;
        }
    }
    return distance;
}

export function rotate(x1: number, y1: number, x2: number, y2: number, angle: number) {
    // 𝑎′𝑥=(𝑎𝑥−𝑐𝑥)cos𝜃−(𝑎𝑦−𝑐𝑦)sin𝜃+𝑐𝑥
    // 𝑎′𝑦=(𝑎𝑥−𝑐𝑥)sin𝜃+(𝑎𝑦−𝑐𝑦)cos𝜃+𝑐𝑦.
    // https://math.stackexchange.com/questions/2204520/how-do-i-rotate-a-line-segment-in-a-specific-point-on-the-line
    return [(x1 - x2) * Math.cos(angle) - (y1 - y2) * Math.sin(angle) + x2, (x1 - x2) * Math.sin(angle) + (y1 - y2) * Math.cos(angle) + y2];
}

export function distanceBetweenPointAndPoint(x1: number, y1: number, x2: number, y2: number) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.hypot(dx, dy);
}

// https://stackoverflow.com/questions/5254838/calculating-distance-between-a-point-and-a-rectangular-box-nearest-point
export function distanceBetweenPointAndRectangle(x: number, y: number, rect: RectangleClient) {
    var dx = Math.max(rect.x - x, 0, x - (rect.x + rect.width));
    var dy = Math.max(rect.y - y, 0, y - (rect.y + rect.height));
    return Math.sqrt(dx * dx + dy * dy);
}

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
    const rectanglePoints = getHandleCenters(rectangle);
    for (let i = 1; i < points.length; i++) {
        const isIntersect =
            isLinesIntersect(points[i], points[i - 1], rectanglePoints[0], rectanglePoints[1]) ||
            isLinesIntersect(points[i], points[i - 1], rectanglePoints[1], rectanglePoints[2]) ||
            isLinesIntersect(points[i], points[i - 1], rectanglePoints[2], rectanglePoints[3]) ||
            isLinesIntersect(points[i], points[i - 1], rectanglePoints[3], rectanglePoints[0]);
        if (isIntersect) return true;
    }

    return false;
};
