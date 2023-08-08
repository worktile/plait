import { PlaitBaseShape } from '../interfaces/shape';
import { PlaitBaseLine } from '../interfaces/line';
import { Point } from '@plait/core';

export const PlaitDraw = {
    isGeo: (value: any): value is PlaitBaseShape => {
        return value.type === 'geometry';
    },
    isLine: (value: any): value is PlaitBaseLine => {
        return value.type === 'line';
    }
};

export const getRectangleByPoints = (points: Point[]) => {
    return {
        x: points[0][0],
        y: points[0][1],
        width: points[1][0] - points[0][0],
        height: points[1][1] - points[0][1]
    };
};
