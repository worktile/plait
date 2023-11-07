import { RectangleClient } from '@plait/core';
import { ShapeEngine } from '../../interfaces';
import { createPolygonEngine } from './polygon';

export const DiamondEngine: ShapeEngine = createPolygonEngine({
    getPolygonPoints: RectangleClient.getEdgeCenterPoints,
    getConnectorPoints(rectangle: RectangleClient) {
        return RectangleClient.getEdgeCenterPoints(rectangle);
    }
});
