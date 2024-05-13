import { RectangleClient } from '@plait/core';
import { PlaitGeometry, ShapeEngine } from '../../interfaces';
import { createPolygonEngine } from './polygon';
import { getTextRectangle } from '../../utils';

export const DiamondEngine: ShapeEngine = createPolygonEngine({
    getPolygonPoints: RectangleClient.getEdgeCenterPoints,
    getConnectorPoints(rectangle: RectangleClient) {
        return RectangleClient.getEdgeCenterPoints(rectangle);
    },
    getTextRectangle(element: PlaitGeometry) {
        const rectangle = getTextRectangle(element);
        rectangle.width = rectangle.width / 2;
        rectangle.x += rectangle.width / 2;
        return rectangle;
    }
});
