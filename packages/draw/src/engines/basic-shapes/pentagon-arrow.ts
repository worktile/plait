import { PlaitBoard, Point, RectangleClient } from '@plait/core';
import { PlaitGeometry, ShapeEngine } from '../../interfaces';
import { createPolygonEngine } from './polygon';
import { getCustomTextRectangle, getTextRectangle } from '../../utils';
import { ShapeDefaultSpace } from '../../constants';

export const getPentagonArrowPoints = (rectangle: RectangleClient): Point[] => {
    const wider = rectangle.width > rectangle.height / 2;
    return [
        [rectangle.x, rectangle.y],
        [rectangle.x + (wider ? rectangle.width - rectangle.height / 2 : 0), rectangle.y],
        [rectangle.x + rectangle.width, rectangle.y + rectangle.height / 2],
        [rectangle.x + (wider ? rectangle.width - rectangle.height / 2 : 0), rectangle.y + rectangle.height],
        [rectangle.x, rectangle.y + rectangle.height]
    ];
};

export const PentagonArrowEngine: ShapeEngine = createPolygonEngine({
    getPolygonPoints: getPentagonArrowPoints,
    getConnectorPoints(rectangle: RectangleClient) {
        return RectangleClient.getEdgeCenterPoints(rectangle);
    },
    getTextRectangle: (board: PlaitBoard, element: PlaitGeometry) => {
        const elementRectangle = RectangleClient.getRectangleByPoints(element.points!);
        const customTextRectangle = getCustomTextRectangle(board, element, 3 / 4);
        customTextRectangle.x = elementRectangle.x + ShapeDefaultSpace.rectangleAndText;
        return customTextRectangle;
    }
});
