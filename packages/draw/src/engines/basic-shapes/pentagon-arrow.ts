import { PlaitElement, Point, RectangleClient } from '@plait/core';
import { ShapeEngine } from '../../interfaces';
import { createPolygonEngine } from './polygon';
import { getTextRectangle } from '../../utils';

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
    getTextRectangle(element: PlaitElement) {
        const elementRectangle = RectangleClient.getRectangleByPoints(element.points!);
        const rectangle = getTextRectangle(element);
        const wider = elementRectangle.width > elementRectangle.height / 2 + 20;
        rectangle.width = wider ? elementRectangle.width - elementRectangle.height / 2 : rectangle.width;
        return rectangle;
    }
});
