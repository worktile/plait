import { Point } from '@plait/core';

export const getRectangleByPoints = (points: Point[]) => {
    let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity;
    points.forEach(point => {
        minX = Math.min(point[0], minX);
        maxX = Math.max(point[0], maxX);
        minY = Math.min(point[1], minY);
        maxY = Math.max(point[1], maxY);
    });

    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
    };
};
