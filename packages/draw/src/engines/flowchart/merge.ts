import { Point, RectangleClient } from '@plait/core';
import { ShapeEngine } from '../../interfaces';
import { getCenterPointsOnPolygon } from '../../utils/geometry';
import { createPolygonEngine } from '../basic-shapes/polygon';

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
    }
});
