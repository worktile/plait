import { PlaitBoard, Point, RectangleClient, isPointInEllipse } from '@plait/core';
import { ShapeMethods } from '../../interfaces';
import { drawEllipse, getNearestPointBetweenPointAndEllipse } from '../geometry';
import { Options } from 'roughjs/bin/core';

export const EllipseMethods: ShapeMethods = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        return drawEllipse(board, rectangle, options);
    },
    isHit(rectangle: RectangleClient, point: Point) {
        const centerPoint: Point = [rectangle.x + rectangle.width / 2, rectangle.y + rectangle.height / 2];
        return isPointInEllipse(point, centerPoint, rectangle.width / 2, rectangle.height / 2);
    },
    getNearestPoint(rectangle: RectangleClient, point: Point) {
        const centerPoint: Point = [rectangle.x + rectangle.width / 2, rectangle.y + rectangle.height / 2];
        return getNearestPointBetweenPointAndEllipse(point, centerPoint, rectangle.width / 2, rectangle.height / 2);
    },
    getConnectorPoints(rectangle: RectangleClient) {
        return RectangleClient.getEdgeCenterPoints(rectangle);
    }
};
