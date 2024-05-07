import { PlaitElement, Point, RectangleClient } from '@plait/core';
import { ShapeEngine } from '../../interfaces';
import { createPolygonEngine } from '../basic-shapes/polygon';
import { getTextRectangle } from '../../utils';

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
    },
    getTextRectangle(element: PlaitElement) {
        const rectangle = getTextRectangle(element);
        const width = rectangle.width;
        rectangle.width = (rectangle.width * 2) / 3;
        rectangle.x += width / 6;
        return rectangle;
    }
});
