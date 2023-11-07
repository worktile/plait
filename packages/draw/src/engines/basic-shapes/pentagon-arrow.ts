import { Point, RectangleClient } from '@plait/core';
import { ShapeEngine } from '../../interfaces';
import { createPolygonEngine } from './polygon';

export const getPentagonArrowPoints = (rectangle: RectangleClient): Point[] => {
    return [
        [rectangle.x, rectangle.y],
        [rectangle.x + (rectangle.width * 3) / 5, rectangle.y],
        [rectangle.x + rectangle.width, rectangle.y + rectangle.height / 2],
        [rectangle.x + (rectangle.width * 3) / 5, rectangle.y + rectangle.height],
        [rectangle.x, rectangle.y + rectangle.height]
    ];
};

export const PentagonArrowEngine: ShapeEngine = createPolygonEngine({
    getPolygonPoints: getPentagonArrowPoints,
    getConnectorPoints(rectangle: RectangleClient) {
        return RectangleClient.getEdgeCenterPoints(rectangle);
    }
});
