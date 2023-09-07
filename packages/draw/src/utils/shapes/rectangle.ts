import { PlaitBoard, Point, RectangleClient, getNearestPointBetweenPointAndSegments } from '@plait/core';
import { ShapeMethods } from '../../interfaces';
import { Options } from 'roughjs/bin/core';
import { drawRectangle } from '@plait/common';

export const RectangleMethods: ShapeMethods = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        return drawRectangle(board, rectangle, options);
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
