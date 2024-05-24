import { Point, RectangleClient } from '@plait/core';
import { PlaitGeometry, ShapeEngine } from '../../interfaces';
import { createPolygonEngine } from '../basic-shapes/polygon';
import { ShapeDefaultSpace } from '../../constants';
import { getStrokeWidthByElement } from '../../utils';

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
    getTextRectangle: (element: PlaitGeometry) => {
        const elementRectangle = RectangleClient.getRectangleByPoints(element.points!);
        const strokeWidth = getStrokeWidthByElement(element);
        const height = element.textHeight!;
        const width = elementRectangle.width - ShapeDefaultSpace.rectangleAndText * 2 - strokeWidth * 2;
        return {
            width: width > 0 ? width : 0,
            height: height,
            x: elementRectangle.x + ShapeDefaultSpace.rectangleAndText + strokeWidth,
            y: elementRectangle.y + (elementRectangle.height - elementRectangle.height / 2 - height) / 2
        };
    }
});
