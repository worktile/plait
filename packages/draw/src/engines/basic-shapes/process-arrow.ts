import { PlaitBoard, Point, RectangleClient } from '@plait/core';
import { PlaitGeometry, ShapeEngine } from '../../interfaces';
import { createPolygonEngine } from './polygon';
import { getCustomTextRectangle } from '../../utils';

export const getProcessArrowPoints = (rectangle: RectangleClient): Point[] => {
    const wider = rectangle.width > rectangle.height / 2;
    return [
        [rectangle.x, rectangle.y],
        [rectangle.x + (wider ? rectangle.width - rectangle.height / 2 : 0), rectangle.y],
        [rectangle.x + rectangle.width, rectangle.y + rectangle.height / 2],
        [rectangle.x + (wider ? rectangle.width - rectangle.height / 2 : 0), rectangle.y + rectangle.height],
        [rectangle.x, rectangle.y + rectangle.height],
        [rectangle.x + (wider ? rectangle.height / 2 : rectangle.width), rectangle.y + rectangle.height / 2]
    ];
};

export const ProcessArrowEngine: ShapeEngine = createPolygonEngine({
    getPolygonPoints: getProcessArrowPoints,
    getTextRectangle: (board: PlaitBoard, element: PlaitGeometry) => {
        const elementRectangle = RectangleClient.getRectangleByPoints(element.points!);
        const wider = elementRectangle.width > elementRectangle.height + 20;
        const widthRatio = wider ? (elementRectangle.width - elementRectangle.height) / elementRectangle.width : 3 / 4;
        const customTextRectangle = getCustomTextRectangle(board, element, widthRatio);
        return customTextRectangle;
    }
});
