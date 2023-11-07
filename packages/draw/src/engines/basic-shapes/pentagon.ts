import { Point, RectangleClient } from '@plait/core';
import { ShapeEngine } from '../../interfaces';
import { createPolygonEngine } from './polygon';

export const getPentagonPoints = (rectangle: RectangleClient): Point[] => {
    return [
        [rectangle.x + rectangle.width / 2, rectangle.y],
        [rectangle.x + rectangle.width, rectangle.y + (rectangle.height * 2) / 5],
        [rectangle.x + (rectangle.width * 4) / 5, rectangle.y + rectangle.height],
        [rectangle.x + rectangle.width / 5, rectangle.y + rectangle.height],
        [rectangle.x, rectangle.y + (rectangle.height * 2) / 5]
    ];
};

export const PentagonEngine: ShapeEngine = createPolygonEngine({
    getPolygonPoints: getPentagonPoints
});
