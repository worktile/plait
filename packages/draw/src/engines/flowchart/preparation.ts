import { Point, RectangleClient } from '@plait/core';
import { ShapeEngine } from '../../interfaces';
import { createPolygonEngine } from '../basic-shapes/polygon';

export const getPreparationPoints = (rectangle: RectangleClient): Point[] => {
    return [
        [rectangle.x, rectangle.y + rectangle.height / 2],
        [rectangle.x + rectangle.width / 6, rectangle.y],
        [rectangle.x + (rectangle.width * 5) / 6, rectangle.y],
        [rectangle.x + rectangle.width, rectangle.y + rectangle.height / 2],
        [rectangle.x + (rectangle.width * 5) / 6, rectangle.y + rectangle.height],
        [rectangle.x + rectangle.width / 6, rectangle.y + rectangle.height]
    ];
};

export const PreparationEngine: ShapeEngine = createPolygonEngine({
    getPolygonPoints: getPreparationPoints,
    getConnectorPoints: (rectangle: RectangleClient) => {
        return RectangleClient.getEdgeCenterPoints(rectangle);
    }
});
