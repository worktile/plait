import { PlaitBaseGeometry } from '../interfaces/geometry';
import { PlaitBaseLine } from '../interfaces/line';
import { Point } from '@plait/core';



export const getRectangleByPoints = (points: Point[]) => {
    return {
        x: points[0][0],
        y: points[0][1],
        width: points[1][0] - points[0][0],
        height: points[1][1] - points[0][1]
    };
};
