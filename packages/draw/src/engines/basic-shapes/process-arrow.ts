import { Point, RectangleClient } from '@plait/core';
import { ShapeEngine } from '../../interfaces';
import { createPolygonEngine } from './polygon';

export const getProcessArrowPoints = (rectangle: RectangleClient): Point[] => {
    const wider = rectangle.width > rectangle.height / 2;
    return [
        [rectangle.x, rectangle.y],
        [rectangle.x + (wider ? rectangle.width - rectangle.height / 2 : 0), rectangle.y],
        [rectangle.x + rectangle.width, rectangle.y + rectangle.height / 2],
        [rectangle.x + (wider ? rectangle.width - rectangle.height / 2 : 0), rectangle.y + rectangle.height],
        [rectangle.x, rectangle.y + rectangle.height],
        [rectangle.x + (wider ? rectangle.height / 2 : rectangle.width), rectangle.y + rectangle.height / 2]
    ];
};

export const ProcessArrowEngine: ShapeEngine = createPolygonEngine({
    getPolygonPoints: getProcessArrowPoints
});
