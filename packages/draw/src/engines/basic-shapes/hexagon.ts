import { Point, RectangleClient } from '@plait/core';
import { ShapeEngine } from '../../interfaces';
import { createPolygonEngine } from './polygon';

export const getHexagonPoints = (rectangle: RectangleClient): Point[] => {
    return [
        [rectangle.x + rectangle.width / 4, rectangle.y],
        [rectangle.x + (rectangle.width * 3) / 4, rectangle.y],
        [rectangle.x + rectangle.width, rectangle.y + rectangle.height / 2],
        [rectangle.x + (rectangle.width * 3) / 4, rectangle.y + rectangle.height],
        [rectangle.x + rectangle.width / 4, rectangle.y + rectangle.height],
        [rectangle.x, rectangle.y + rectangle.height / 2]
    ];
};

export const HexagonEngine: ShapeEngine = createPolygonEngine({
    getPolygonPoints: getHexagonPoints,
    getConnectorPoints(rectangle: RectangleClient) {
        return RectangleClient.getEdgeCenterPoints(rectangle);
    }
});
