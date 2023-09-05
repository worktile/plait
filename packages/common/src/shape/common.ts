import { Point } from '@plait/core';

export const normalizeShapePoints = (points: [Point, Point], shift: boolean = false): [Point, Point] => {
    let start = points[0];
    let end = points[1];
    if (shift) {
        const width = Math.abs(start[0] - end[0]);
        const height = Math.abs(start[1] - end[1]);
        const edge = Math.max(height, width);
        end = [start[0] + (end[0] > start[0] ? edge : -edge), start[1] + (end[1] > start[1] ? edge : -edge)];
    }

    const leftTopPoint: Point = [Math.min(start[0], end[0]), Math.min(start[1], end[1])];
    let rightBottomPoint: Point = [Math.max(start[0], end[0]), Math.max(start[1], end[1])];

    return [leftTopPoint, rightBottomPoint];
};
