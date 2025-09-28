import { PlaitBoard, Point, RectangleClient } from '@plait/core';
import { PlaitGeometry, ShapeEngine } from '../../interfaces';
import { createPolygonEngine } from '../basic-shapes/polygon';
import { getCenterPointsOnPolygon } from '../../utils/polygon';
import { getCustomTextRectangle } from '../../utils';

export const getMergePoints = (rectangle: RectangleClient): Point[] => {
    return [
        [rectangle.x, rectangle.y],
        [rectangle.x + rectangle.width, rectangle.y],
        [rectangle.x + rectangle.width / 2, rectangle.y + rectangle.height]
    ];
};

export const MergeEngine: ShapeEngine = createPolygonEngine({
    getPolygonPoints: getMergePoints,
    getConnectorPoints: (rectangle: RectangleClient) => {
        const cornerPoints = getMergePoints(rectangle);
        const lineCenterPoints = getCenterPointsOnPolygon(cornerPoints);
        return [...lineCenterPoints, ...cornerPoints];
    },
    getTextRectangle: (board: PlaitBoard, element: PlaitGeometry) => {
        const elementRectangle = RectangleClient.getRectangleByPoints(element.points!);
        const textRectangle = getCustomTextRectangle(board, element, 2 / 3);
        textRectangle.y = elementRectangle.y + (elementRectangle.height * (1 / 2) - textRectangle.height) / 2;
        return textRectangle;
    }
});
