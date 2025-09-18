import { PlaitBoard, Point, RectangleClient } from '@plait/core';
import { getTextSize } from '../../utils/text-size';
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
    getTextRectangle: (board: PlaitBoard, element: PlaitGeometry) => {
        const elementRectangle = RectangleClient.getRectangleByPoints(element.points!);
        const strokeWidth = getStrokeWidthByElement(element);
        const width = elementRectangle.width - ShapeDefaultSpace.rectangleAndText * 2 - strokeWidth * 2;
        const text = element.text!;
        const textSize = getTextSize(board, text, width);
        return {
            width: width > 0 ? width : 0,
            height: textSize.height,
            x: elementRectangle.x + ShapeDefaultSpace.rectangleAndText + strokeWidth,
            y: elementRectangle.y + (elementRectangle.height - elementRectangle.height / 2 - textSize.height) / 2
        };
    }
});
