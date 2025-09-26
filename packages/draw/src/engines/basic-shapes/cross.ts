import { PlaitBoard, Point, RectangleClient } from '@plait/core';
import { PlaitGeometry, ShapeEngine } from '../../interfaces';
import { createPolygonEngine } from './polygon';
import { getCustomTextRectangle, getTextRectangle } from '../../utils';
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

export const CrossEngine: ShapeEngine = createPolygonEngine({
    getPolygonPoints: getCrossPoints,
    getConnectorPoints(rectangle: RectangleClient) {
        return RectangleClient.getEdgeCenterPoints(rectangle);
    },
    getTextRectangle: (board: PlaitBoard, element: PlaitGeometry) => {
        const widthRatio = 1 / 2;
        return getCustomTextRectangle(board, element, widthRatio);
    }
});
