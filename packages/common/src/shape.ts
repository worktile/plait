import { Point } from '@plait/core';

export const normalizeShapePoints = (points: [Point, Point]): [Point, Point] => {
    const leftTopPoint: Point = [Math.min(points[0][0], points[1][0]), Math.min(points[0][1], points[1][1])];
    const rightBottomPoint: Point = [Math.max(points[0][0], points[1][0]), Math.max(points[0][1], points[1][1])];
    return [leftTopPoint, rightBottomPoint];
};
