import { PlaitBoard, Point, RectangleClient } from '@plait/core';
import { PlaitGeometry, ShapeEngine } from '../../interfaces';
import { createPolygonEngine } from '../basic-shapes/polygon';
import { getCustomTextRectangle } from '../../utils';

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
    getTextRectangle(board: PlaitBoard, element: PlaitGeometry) {
        const rectangle = getCustomTextRectangle(board, element, 2 / 3);
        return rectangle;
    }
});
