import { Point, RectangleClient } from '@plait/core';
import { PlaitGeometry, ShapeEngine } from '../../interfaces';
import { createPolygonEngine } from './polygon';
import { getTextRectangle } from '../../utils';

export const getLeftArrowPoints = (rectangle: RectangleClient): Point[] => {
    return [
        [rectangle.x, rectangle.y + rectangle.height / 2],
        [rectangle.x + rectangle.width * 0.32, rectangle.y],
        [rectangle.x + rectangle.width * 0.32, rectangle.y + rectangle.height * 0.2],
        [rectangle.x + rectangle.width, rectangle.y + rectangle.height * 0.2],
        [rectangle.x + rectangle.width, rectangle.y + rectangle.height * 0.8],
        [rectangle.x + rectangle.width * 0.32, rectangle.y + rectangle.height * 0.8],
        [rectangle.x + rectangle.width * 0.32, rectangle.y + rectangle.height]
    ];
};

export const LeftArrowEngine: ShapeEngine = createPolygonEngine({
    getPolygonPoints: getLeftArrowPoints,
    getConnectorPoints: (rectangle: RectangleClient) => {
        return [
            [rectangle.x, rectangle.y + rectangle.height / 2],
            [rectangle.x + rectangle.width, rectangle.y + rectangle.height / 2]
        ];
    },
    getTextRectangle(element: PlaitGeometry) {
        const rectangle = getTextRectangle(element);
        const width = rectangle.width;
        rectangle.width = rectangle.width * (1 - 0.32);
        rectangle.x += width * 0.32;
        return rectangle;
    }
});
