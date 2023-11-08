import { Point, RectangleClient } from '@plait/core';
import { PlaitGeometry, ShapeEngine } from '../../interfaces';
import { getCenterPointsOnPolygon, getTextRectangle } from '../../utils/geometry';
import { createPolygonEngine } from '../basic-shapes/polygon';

export const getManualLoopPoints = (rectangle: RectangleClient): Point[] => {
    return [
        [rectangle.x, rectangle.y],
        [rectangle.x + rectangle.width, rectangle.y],
        [rectangle.x + (rectangle.width * 7) / 8, rectangle.y + rectangle.height],
        [rectangle.x + rectangle.width / 8, rectangle.y + rectangle.height]
    ];
};
export const ManualLoopEngine: ShapeEngine = createPolygonEngine({
    getPolygonPoints: getManualLoopPoints,
    getConnectorPoints: (rectangle: RectangleClient) => {
        const cornerPoints = getManualLoopPoints(rectangle);
        return getCenterPointsOnPolygon(cornerPoints);
    },
    getTextRectangle(element: PlaitGeometry) {
        const rectangle = getTextRectangle(element);
        const width = rectangle.width;
        rectangle.width = (rectangle.width * 3) / 4;
        rectangle.x += width / 8;
        return rectangle;
    }
});
