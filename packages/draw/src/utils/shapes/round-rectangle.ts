import { PlaitBoard, Point, RectangleClient, drawRoundRectangle, isPointInRoundRectangle } from '@plait/core';
import { ShapeMethods } from '../../interfaces';
import { getNearestPointBetweenPointAndRoundRectangle, getRoundRectangleRadius } from '../geometry';
import { Options } from 'roughjs/bin/core';

export const RoundRectangleMethods: ShapeMethods = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        return drawRoundRectangle(
            PlaitBoard.getRoughSVG(board),
            rectangle.x,
            rectangle.y,
            rectangle.x + rectangle.width,
            rectangle.y + rectangle.height,
            options,
            false,
            getRoundRectangleRadius(rectangle)
        );
    },
    isHit(rectangle: RectangleClient, point: Point) {
        return isPointInRoundRectangle(point, rectangle, getRoundRectangleRadius(rectangle));
    },
    getNearestPoint(rectangle: RectangleClient, point: Point) {
        return getNearestPointBetweenPointAndRoundRectangle(point, rectangle, getRoundRectangleRadius(rectangle));
    },
    getConnectorPoints(rectangle: RectangleClient) {
        return RectangleClient.getEdgeCenterPoints(rectangle);
    }
};
