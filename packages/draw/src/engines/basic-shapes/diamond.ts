import { PlaitElement, RectangleClient } from '@plait/core';
import { ShapeEngine } from '../../interfaces';
import { createPolygonEngine } from './polygon';
import { getTextRectangle } from '../../utils';

export const DiamondEngine: ShapeEngine = createPolygonEngine({
    getPolygonPoints: RectangleClient.getEdgeCenterPoints,
    getConnectorPoints(rectangle: RectangleClient) {
        return RectangleClient.getEdgeCenterPoints(rectangle);
    },
    getTextRectangle(element: PlaitElement) {
        const rectangle = getTextRectangle(element);
        rectangle.width = rectangle.width / 2;
        rectangle.x += rectangle.width / 2;
        return rectangle;
    }
});
