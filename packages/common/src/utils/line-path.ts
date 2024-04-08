import { Point, distanceBetweenPointAndPoint } from '@plait/core';
import { isPointOnSegment } from './math';

export function getPointOnPolyline(points: Point[], ratio: number) {
    const totalLength = calculatePolylineLength(points);
    const targetDistance = totalLength * ratio;

    let accumulatedDistance = 0;
    for (let i = 0; i < points.length - 1; i++) {
        const [x1, y1] = points[i];
        const [x2, y2] = points[i + 1];
        const segmentLength = distanceBetweenPointAndPoint(x1, y1, x2, y2);

        if (accumulatedDistance + segmentLength >= targetDistance) {
            const remainingDistance = targetDistance - accumulatedDistance;
            const ratioInSegment = remainingDistance / segmentLength;

            const targetX = x1 + (x2 - x1) * ratioInSegment;
            const targetY = y1 + (y2 - y1) * ratioInSegment;
            return [targetX, targetY];
        }

        accumulatedDistance += segmentLength;
    }

    return points[points.length - 1];
}

export function calculatePolylineLength(points: Point[]) {
    let length = 0;
    for (let i = 0; i < points.length - 1; i++) {
        const [x1, y1] = points[i];
        const [x2, y2] = points[i + 1];
        length += distanceBetweenPointAndPoint(x1, y1, x2, y2);
    }
    return length;
}

export function getRatioByPoint(points: Point[], point: Point) {
    const totalLength = calculatePolylineLength(points);
    let distance = 0;
    for (let i = 0; i < points.length - 1; i++) {
        const isOverlap = isPointOnSegment(point, points[i], points[i + 1]);
        if (isOverlap) {
            distance += distanceBetweenPointAndPoint(point[0], point[1], points[i][0], points[i][1]);
            return distance / totalLength;
        } else {
            distance += distanceBetweenPointAndPoint(points[i][0], points[i][1], points[i + 1][0], points[i + 1][1]);
        }
    }
    throw new Error('Cannot get ratio by point');
}

export const removeDuplicatePoints = (points: Point[]) => {
    const newArray: Point[] = [];
    points.forEach(point => {
        const index = newArray.findIndex(otherPoint => {
            return Point.isEquals(point, otherPoint);
        });
        if (index === -1) newArray.push(point);
    });
    return newArray;
};

export function simplifyOrthogonalPoints(points: Point[]) {
    if (points.length <= 2) return points;
    let simplifiedPoints: Point[] = [points[0]];
    for (let i = 1; i < points.length - 1; i++) {
        const previous = points[i - 1];
        const current = points[i];
        const next = points[i + 1];
        const isTurn = !(Point.isOverHorizontal([previous, current, next]) || Point.isOverVertical([previous, current, next]));
        if (isTurn) {
            simplifiedPoints.push(current);
        }
    }
    simplifiedPoints.push(points[points.length - 1]);
    return simplifiedPoints;
}

export const getExtendPoint = (source: Point, target: Point, extendDistance: number): Point => {
    const distance = distanceBetweenPointAndPoint(...source, ...target);
    const isEqual = Point.isEquals(source, target);
    const sin = isEqual ? 1 : (target[1] - source[1]) / distance;
    const cos = isEqual ? 1 : (target[0] - source[0]) / distance;
    return [source[0] + extendDistance * cos, source[1] + extendDistance * sin];
};
