import { Point, RectangleClient } from '@plait/core';
import { PlaitGeometry, ShapeEngine } from '../../interfaces';
import { createPolygonEngine } from './polygon';
import { getStrokeWidthByElement } from '../../utils';
import { ShapeDefaultSpace } from '../../constants';

export const getStarPoints = (rectangle: RectangleClient): Point[] => {
    return [
        [rectangle.x + rectangle.width / 2, rectangle.y + (rectangle.height * 75) / 91],
        [rectangle.x + (rectangle.width * 18.61) / 96, rectangle.y + rectangle.height],
        [rectangle.x + (rectangle.width * 24.2235871) / 96, rectangle.y + (rectangle.height * 57.7254249) / 91],
        [rectangle.x, rectangle.y + (rectangle.height * 34.5491503) / 91],
        [rectangle.x + (rectangle.width * 33.3053687) / 96, rectangle.y + (rectangle.height * 29.7745751) / 91],
        [rectangle.x + rectangle.width / 2, rectangle.y],
        [rectangle.x + (rectangle.width * 62.6946313) / 96, rectangle.y + (rectangle.height * 29.7745751) / 91],
        [rectangle.x + rectangle.width, rectangle.y + (rectangle.height * 34.5491503) / 91],
        [rectangle.x + (rectangle.width * 71.7764129) / 96, rectangle.y + (rectangle.height * 57.7254249) / 91],
        [rectangle.x + (rectangle.width * 77.3892626) / 96, rectangle.y + rectangle.height]
    ];
};

export const StarEngine: ShapeEngine = createPolygonEngine({
    getPolygonPoints: getStarPoints,
    getConnectorPoints: (rectangle: RectangleClient) => {
        const points = getStarPoints(rectangle);
        return [points[1], points[3], points[5], points[7], points[9]];
    },
    getTextRectangle(element: PlaitGeometry) {
        const elementRectangle = RectangleClient.getRectangleByPoints(element.points!);
        const strokeWidth = getStrokeWidthByElement(element);
        const height = element.textHeight!;
        const originWidth = elementRectangle.width - ShapeDefaultSpace.rectangleAndText * 2 - strokeWidth * 2;
        const width = originWidth / 2;
        return {
            height,
            width: width > 0 ? width : 0,
            x: elementRectangle.x + ShapeDefaultSpace.rectangleAndText + strokeWidth + originWidth / 4,
            y: elementRectangle.y + (elementRectangle.height * 1) / 6 + ((elementRectangle.height * 4) / 5 - height) / 2
        };
    }
});
