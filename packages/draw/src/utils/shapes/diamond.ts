import { PlaitBoard, Point, RectangleClient, getNearestPointBetweenPointAndSegments, isPointInPolygon } from '@plait/core';
import { ShapeMethods } from '../../interfaces';
import { Options } from 'roughjs/bin/core';
import { drawDiamond } from '../geometry';

export const DiamondMethods: ShapeMethods = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        return drawDiamond(board, rectangle, options);
    },
    isHit(rectangle: RectangleClient, point: Point) {
        const controlPoints = RectangleClient.getEdgeCenterPoints(rectangle);
        return isPointInPolygon(point, controlPoints);
    },
    getNearestPoint(rectangle: RectangleClient, point: Point) {
        const connectorPoints = RectangleClient.getEdgeCenterPoints(rectangle);
        return getNearestPointBetweenPointAndSegments(point, connectorPoints);
    },
    getConnectorPoints(rectangle: RectangleClient) {
        return RectangleClient.getEdgeCenterPoints(rectangle);
    }
};
