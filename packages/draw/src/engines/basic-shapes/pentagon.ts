import { PlaitBoard, Point, RectangleClient } from '@plait/core';
import { PlaitGeometry, ShapeEngine } from '../../interfaces';
import { createPolygonEngine } from './polygon';
import { getCustomTextRectangle } from '../../utils';
import { ShapeDefaultSpace } from '../../constants';

export const getPentagonPoints = (rectangle: RectangleClient): Point[] => {
    return [
        [rectangle.x + rectangle.width / 2, rectangle.y],
        [rectangle.x + rectangle.width, rectangle.y + (rectangle.height * 2) / 5],
        [rectangle.x + (rectangle.width * 4) / 5, rectangle.y + rectangle.height],
        [rectangle.x + rectangle.width / 5, rectangle.y + rectangle.height],
        [rectangle.x, rectangle.y + (rectangle.height * 2) / 5]
    ];
};

export const PentagonEngine: ShapeEngine = createPolygonEngine({
    getPolygonPoints: getPentagonPoints,
    getTextRectangle: (board: PlaitBoard, element: PlaitGeometry) => {
        const elementRectangle = RectangleClient.getRectangleByPoints(element.points!);
        const customTextRectangle = getCustomTextRectangle(board, element, 3 / 5);
        const startY = elementRectangle.y + elementRectangle.height / 5;
        const endY = elementRectangle.y + elementRectangle.height;
        customTextRectangle.y = startY + (endY - startY - customTextRectangle.height) / 2;
        return customTextRectangle;
    }
});
