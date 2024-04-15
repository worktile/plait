import { Point, RectangleClient } from '@plait/core';
import { PlaitGeometry, ShapeEngine } from '../../interfaces';
import { createPolygonEngine } from './polygon';
import { getStrokeWidthByElement } from '../../utils';
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
    getTextRectangle(element: PlaitGeometry) {
        const elementRectangle = RectangleClient.getRectangleByPoints(element.points!);
        const strokeWidth = getStrokeWidthByElement(element);
        const height = element.textHeight!;
        const originWidth = elementRectangle.width - ShapeDefaultSpace.rectangleAndText * 2 - strokeWidth * 2;
        const width = (originWidth * 3) / 5;
        return {
            height,
            width: width > 0 ? width : 0,
            x: elementRectangle.x + ShapeDefaultSpace.rectangleAndText + strokeWidth + originWidth / 5,
            y: elementRectangle.y + elementRectangle.height / 5 + ((elementRectangle.height * 4) / 5 - height) / 2
        };
    }
});
