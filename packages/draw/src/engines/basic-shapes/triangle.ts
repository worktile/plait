import { PlaitBoard, Point, RectangleClient } from '@plait/core';
import { PlaitGeometry, ShapeEngine } from '../../interfaces';
import { createPolygonEngine } from './polygon';
import { getCenterPointsOnPolygon } from '../../utils/polygon';
import { getCustomTextRectangle } from '../../utils';

export const getTrianglePoints = (rectangle: RectangleClient): Point[] => {
    return [
        [rectangle.x + rectangle.width / 2, rectangle.y],
        [rectangle.x + rectangle.width, rectangle.y + rectangle.height],
        [rectangle.x, rectangle.y + rectangle.height]
    ];
};

export const TriangleEngine: ShapeEngine = createPolygonEngine({
    getPolygonPoints: getTrianglePoints,
    getConnectorPoints(rectangle: RectangleClient) {
        const cornerPoints = getTrianglePoints(rectangle);
        const lineCenterPoints = getCenterPointsOnPolygon(cornerPoints);
        return [...lineCenterPoints, ...cornerPoints];
    },
    getTextRectangle: (board: PlaitBoard, element: PlaitGeometry) => {
        const customTextRectangle = getCustomTextRectangle(board, element, 1 / 2);
        const elementRectangle = RectangleClient.getRectangleByPoints(element.points!);
        customTextRectangle.y =
            elementRectangle.y +
            (elementRectangle.height * 2.5) / 5 +
            (elementRectangle.height - (elementRectangle.height * 2.5) / 5 - customTextRectangle.height) / 2;
        return customTextRectangle;
    }
});
