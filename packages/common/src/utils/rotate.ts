import { Point, rotate } from '@plait/core';

export const rotatePoints = (points: Point[], centerPoint: Point, angle: number) => {
    if (!angle) {
        angle = 0;
    }
    return points.map(point => {
        return rotate(point[0], point[1], centerPoint[0], centerPoint[1], angle) as Point;
    });
};
