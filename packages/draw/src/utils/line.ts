import { Point, XYPosition, idCreator, distanceBetweenPointAndSegments } from '@plait/core';
import { getPoints, Direction } from '@plait/common';

import { LineHandle, LineShape, PlaitLine } from '../interfaces';

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
        const source = element.points[0];
        const target = element.points[1];
        const points: Point[] = getPoints(source, Direction.left, target, Direction.right, 0);
        return points;
    }
    return element.points;
};

export const isHitPolyLine = (pathPoints: Point[], point: Point, strokeWidth: number, expand: number = 0) => {
    const distance = distanceBetweenPointAndSegments(pathPoints, point);
    return distance <= strokeWidth + expand;
};
