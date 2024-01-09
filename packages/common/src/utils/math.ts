import { Point, distanceBetweenPointAndPoint } from '@plait/core';

export function isPointOnSegment(point: Point, startPoint: Point, endPoint: Point) {
    const distanceToStart = distanceBetweenPointAndPoint(point[0], point[1], startPoint[0], startPoint[1]);
    const distanceToEnd = distanceBetweenPointAndPoint(point[0], point[1], endPoint[0], endPoint[1]);
    const segmentLength = distanceBetweenPointAndPoint(startPoint[0], startPoint[1], endPoint[0], endPoint[1]);
    return Math.abs(distanceToStart + distanceToEnd - segmentLength) < 0.1;
}
