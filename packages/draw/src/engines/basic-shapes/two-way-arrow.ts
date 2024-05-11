import { Point, RectangleClient } from '@plait/core';
import { GeometryEngine } from '../../interfaces';
import { createPolygonEngine } from './polygon';

export const getTwoWayArrowPoints = (rectangle: RectangleClient): Point[] => {
    return [
        [rectangle.x, rectangle.y + rectangle.height / 2],
        [rectangle.x + (rectangle.width * 8) / 25, rectangle.y],
        [rectangle.x + (rectangle.width * 8) / 25, rectangle.y + rectangle.height / 5],
        [rectangle.x + (rectangle.width * 17) / 25, rectangle.y + rectangle.height / 5],
        [rectangle.x + (rectangle.width * 17) / 25, rectangle.y],
        [rectangle.x + rectangle.width, rectangle.y + rectangle.height / 2],
        [rectangle.x + (rectangle.width * 17) / 25, rectangle.y + rectangle.height],
        [rectangle.x + (rectangle.width * 17) / 25, rectangle.y + (rectangle.height * 4) / 5],
        [rectangle.x + (rectangle.width * 8) / 25, rectangle.y + (rectangle.height * 4) / 5],
        [rectangle.x + (rectangle.width * 8) / 25, rectangle.y + rectangle.height]
    ];
};

export const TwoWayArrowEngine: GeometryEngine = createPolygonEngine({
    getPolygonPoints: getTwoWayArrowPoints,
    getConnectorPoints: (rectangle: RectangleClient) => {
        return [
            [rectangle.x, rectangle.y + rectangle.height / 2],
            [rectangle.x + rectangle.width, rectangle.y + rectangle.height / 2]
        ];
    }
});
