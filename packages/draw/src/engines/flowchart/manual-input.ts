import { PlaitBoard, Point, RectangleClient } from '@plait/core';
import { PlaitGeometry, ShapeEngine } from '../../interfaces';
import { createPolygonEngine } from '../basic-shapes/polygon';
import { getCenterPointsOnPolygon } from '../../utils/polygon';
import { getCustomTextRectangle } from '../../utils';

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
        const elementRectangle = RectangleClient.getRectangleByPoints(element.points);
        const textRectangle = getCustomTextRectangle(board, element, 1);
        textRectangle.y =
            elementRectangle.y +
            elementRectangle.height / 5 +
            (elementRectangle.height - elementRectangle.height / 5 - textRectangle.height) / 2;
        return textRectangle;
    }
});
