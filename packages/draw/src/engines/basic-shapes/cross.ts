import { Point, RectangleClient } from '@plait/core';
import { PlaitGeometry, GeometryEngine } from '../../interfaces';
import { createPolygonEngine } from './polygon';
import { getTextRectangle } from '../../utils';
export const getCrossPoints = (rectangle: RectangleClient): Point[] => {
    return [
        [rectangle.x + rectangle.width / 4, rectangle.y],
        [rectangle.x + (rectangle.width * 3) / 4, rectangle.y],
        [rectangle.x + (rectangle.width * 3) / 4, rectangle.y + rectangle.height / 4],
        [rectangle.x + rectangle.width, rectangle.y + rectangle.height / 4],
        [rectangle.x + rectangle.width, rectangle.y + (rectangle.height * 3) / 4],
        [rectangle.x + (rectangle.width * 3) / 4, rectangle.y + (rectangle.height * 3) / 4],
        [rectangle.x + (rectangle.width * 3) / 4, rectangle.y + rectangle.height],
        [rectangle.x + rectangle.width / 4, rectangle.y + rectangle.height],
        [rectangle.x + rectangle.width / 4, rectangle.y + (rectangle.height * 3) / 4],
        [rectangle.x, rectangle.y + (rectangle.height * 3) / 4],
        [rectangle.x, rectangle.y + rectangle.height / 4],
        [rectangle.x + rectangle.width / 4, rectangle.y + rectangle.height / 4]
    ];
};

export const CrossEngine: GeometryEngine = createPolygonEngine({
    getPolygonPoints: getCrossPoints,
    getConnectorPoints(rectangle: RectangleClient) {
        return RectangleClient.getEdgeCenterPoints(rectangle);
    },
    getTextRectangle(element: PlaitGeometry) {
        const rectangle = getTextRectangle(element);
        const width = rectangle.width;
        rectangle.width = rectangle.width / 2;
        rectangle.x += width / 4;
        return rectangle;
    }
});
