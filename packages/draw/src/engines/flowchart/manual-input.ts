import { Point, RectangleClient } from '@plait/core';
import { ShapeEngine } from '../../interfaces';
import { createPolygonEngine } from '../basic-shapes/polygon';
import { getCenterPointsOnPolygon } from '../../utils';

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
    }
});
