import { PlaitBoard, Point, RectangleClient } from '@plait/core';
import { getTextSize } from '../../utils/text-size';
import { PlaitGeometry, ShapeEngine } from '../../interfaces';
import { createPolygonEngine } from '../basic-shapes/polygon';
import { ShapeDefaultSpace } from '../../constants';
import { getCenterPointsOnPolygon } from '../../utils/polygon';
import { getStrokeWidthByElement } from '../../utils';

export const getManualInputPoints = (rectangle: RectangleClient): Point[] => {
    return [
        [rectangle.x, rectangle.y + rectangle.height / 4],
        [rectangle.x + rectangle.width, rectangle.y],
        [rectangle.x + rectangle.width, rectangle.y + rectangle.height],
        [rectangle.x, rectangle.y + rectangle.height]
    ];
};

export const ManualInputEngine: ShapeEngine = createPolygonEngine({
    getPolygonPoints: getManualInputPoints,
    getConnectorPoints: (rectangle: RectangleClient) => {
        const cornerPoints = getManualInputPoints(rectangle);
        return getCenterPointsOnPolygon(cornerPoints);
    },
    getTextRectangle: (board: PlaitBoard, element: PlaitGeometry) => {
        const elementRectangle = RectangleClient.getRectangleByPoints(element.points!);
        const strokeWidth = getStrokeWidthByElement(element);
        const width = elementRectangle.width - ShapeDefaultSpace.rectangleAndText * 2 - strokeWidth * 2;
        const text = element.text!;
        const textSize = getTextSize(board, text, width);
        return {
            height: textSize.height,
            width: width > 0 ? width : 0,
            x: elementRectangle.x + ShapeDefaultSpace.rectangleAndText + strokeWidth,
            y: elementRectangle.y + elementRectangle.height / 4 + ((elementRectangle.height * 3) / 4 - textSize.height) / 2
        };
    }
});
