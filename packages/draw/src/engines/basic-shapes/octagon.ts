import { PlaitBoard, Point, RectangleClient } from '@plait/core';
import { PlaitGeometry, ShapeEngine } from '../../interfaces';
import { createPolygonEngine } from './polygon';
import { getCustomTextRectangle } from '../../utils';

export const getOctagonPoints = (rectangle: RectangleClient): Point[] => {
    return [
        [rectangle.x + (rectangle.width * 3) / 10, rectangle.y],
        [rectangle.x + (rectangle.width * 7) / 10, rectangle.y],
        [rectangle.x + rectangle.width, rectangle.y + (rectangle.height * 3) / 10],
        [rectangle.x + rectangle.width, rectangle.y + (rectangle.height * 7) / 10],
        [rectangle.x + (rectangle.width * 7) / 10, rectangle.y + rectangle.height],
        [rectangle.x + (rectangle.width * 3) / 10, rectangle.y + rectangle.height],
        [rectangle.x, rectangle.y + (rectangle.height * 7) / 10],
        [rectangle.x, rectangle.y + (rectangle.height * 3) / 10]
    ];
};

export const OctagonEngine: ShapeEngine = createPolygonEngine({
    getPolygonPoints: getOctagonPoints,
    getConnectorPoints(rectangle: RectangleClient) {
        return RectangleClient.getEdgeCenterPoints(rectangle);
    },
    getTextRectangle: (board: PlaitBoard, element: PlaitGeometry) => {
        return getCustomTextRectangle(board, element, 3 / 4);
    }
});
