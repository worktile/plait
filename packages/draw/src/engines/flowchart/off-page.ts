import { PlaitBoard, Point, RectangleClient } from '@plait/core';
import { PlaitGeometry, ShapeEngine } from '../../interfaces';
import { createPolygonEngine } from '../basic-shapes/polygon';
import { getCustomTextRectangle, getTextRectangle } from '../../utils';

export const getOffPagePoints = (rectangle: RectangleClient): Point[] => {
    return [
        [rectangle.x, rectangle.y],
        [rectangle.x + rectangle.width, rectangle.y],
        [rectangle.x + rectangle.width, rectangle.y + rectangle.height / 2],
        [rectangle.x + rectangle.width / 2, rectangle.y + rectangle.height],
        [rectangle.x, rectangle.y + rectangle.height / 2]
    ];
};

export const OffPageEngine: ShapeEngine = createPolygonEngine({
    getPolygonPoints: getOffPagePoints,
    getConnectorPoints: (rectangle: RectangleClient) => {
        return RectangleClient.getEdgeCenterPoints(rectangle);
    },
    getTextRectangle: (board: PlaitBoard, element: PlaitGeometry) => {
        const elementRectangle = RectangleClient.getRectangleByPoints(element.points!);
        const textRectangle = getTextRectangle(board, element);
        textRectangle.y = elementRectangle.y + (elementRectangle.height * 0.5 - textRectangle.height) / 2;
        return textRectangle;
    }
});
