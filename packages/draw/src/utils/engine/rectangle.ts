import { PlaitBoard, Point, RectangleClient, drawRectangle, getNearestPointBetweenPointAndSegments } from '@plait/core';
import { ShapeEngine } from '../../interfaces';
import { Options } from 'roughjs/bin/core';

export const RectangleEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        return drawRectangle(board, rectangle, { ...options, fillStyle: 'solid' });
    },
    isHit(rectangle: RectangleClient, point: Point) {
        const rangeRectangle = RectangleClient.toRectangleClient([point, point]);
        return RectangleClient.isHit(rectangle, rangeRectangle);
    },
    getNearestPoint(rectangle: RectangleClient, point: Point) {
        const cornerPoints = RectangleClient.getCornerPoints(rectangle);
        return getNearestPointBetweenPointAndSegments(point, cornerPoints);
    },
    getConnectorPoints(rectangle: RectangleClient) {
        return RectangleClient.getEdgeCenterPoints(rectangle);
    }
};
