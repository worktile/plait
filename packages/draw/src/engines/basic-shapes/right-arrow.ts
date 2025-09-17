import { PlaitBoard, Point, RectangleClient } from '@plait/core';
import { PlaitGeometry, ShapeEngine } from '../../interfaces';
import { createPolygonEngine } from './polygon';
import { getTextRectangle } from '../../utils';

export const getRightArrowPoints = (rectangle: RectangleClient): Point[] => {
    return [
        [rectangle.x, rectangle.y + rectangle.height * 0.2],
        [rectangle.x + rectangle.width * 0.68, rectangle.y + rectangle.height * 0.2],
        [rectangle.x + rectangle.width * 0.68, rectangle.y],
        [rectangle.x + rectangle.width, rectangle.y + rectangle.height / 2],
        [rectangle.x + rectangle.width * 0.68, rectangle.y + rectangle.height],
        [rectangle.x + rectangle.width * 0.68, rectangle.y + rectangle.height * 0.8],
        [rectangle.x, rectangle.y + rectangle.height * 0.8]
    ];
};

export const RightArrowEngine: ShapeEngine = createPolygonEngine({
    getPolygonPoints: getRightArrowPoints,
    getConnectorPoints: (rectangle: RectangleClient) => {
        return [
            [rectangle.x, rectangle.y + rectangle.height / 2],
            [rectangle.x + rectangle.width, rectangle.y + rectangle.height / 2]
        ];
    },
    getTextRectangle: (board: PlaitBoard, element: PlaitGeometry) => {
        const rectangle = getTextRectangle(board, element);
        rectangle.width = rectangle.width * 0.68;
        return rectangle;
    }
});
