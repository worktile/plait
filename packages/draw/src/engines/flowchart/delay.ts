import {
    PlaitBoard,
    Point,
    PointOfRectangle,
    RectangleClient,
    getNearestPointBetweenPointAndSegments,
    isPointInEllipse,
    setStrokeLinecap
} from '@plait/core';
import { ShapeEngine } from '../../interfaces';
import { Options } from 'roughjs/bin/core';
import { RectangleEngine } from '../basic-shapes/rectangle';
import { getNearestPointBetweenPointAndEllipse, getTangentSlope, getVectorBySlope } from '../basic-shapes/ellipse';

export const DelayEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        const rs = PlaitBoard.getRoughSVG(board);
        const shape = rs.path(
            `M${rectangle.x} ${rectangle.y} L${rectangle.x + (rectangle.width * 3) / 4} ${rectangle.y} A  ${rectangle.width /
                4} ${rectangle.height / 2}, 0, 0, 1,${rectangle.x + (rectangle.width * 3) / 4} ${rectangle.y + rectangle.height} L${
                rectangle.x
            } ${rectangle.y + rectangle.height} Z`,
            { ...options, fillStyle: 'solid' }
        );
        setStrokeLinecap(shape, 'round');

        return shape;
    },
    isHit(rectangle: RectangleClient, point: Point) {
        //split shape to rectangle and a half ellipse
        const rangeRectangle = RectangleClient.toRectangleClient([point, point]);
        const isInRectangle = RectangleClient.isHit(
            {
                ...rectangle,
                width: (rectangle.width * 3) / 4
            },
            rangeRectangle
        );
        const isInEllipse = isPointInEllipse(
            point,
            [rectangle.x + (rectangle.width * 3) / 4, rectangle.y + rectangle.height / 2],
            rectangle.width / 4,
            rectangle.height / 2
        );
        return isInRectangle || isInEllipse;
    },
    getCornerPoints(rectangle: RectangleClient) {
        return RectangleClient.getCornerPoints(rectangle);
    },
    getNearestPoint(rectangle: RectangleClient, point: Point) {
        const nearestPoint = getNearestPointBetweenPointAndSegments(point, RectangleEngine.getCornerPoints(rectangle));
        if (nearestPoint[0] > rectangle.x + (rectangle.width * 3) / 4) {
            return getNearestPointBetweenPointAndEllipse(
                point,
                [rectangle.x + (rectangle.width * 3) / 4, rectangle.y + rectangle.height / 2],
                rectangle.width / 4,
                rectangle.height / 2
            );
        }
        return nearestPoint;
    },
    getTangentVectorByConnectionPoint(rectangle: RectangleClient, pointOfRectangle: PointOfRectangle) {
        const connectionPoint = RectangleClient.getConnectionPoint(rectangle, pointOfRectangle);
        const centerPoint: Point = [rectangle.x + (rectangle.width * 3) / 4, rectangle.y + rectangle.height / 2];
        const point = [connectionPoint[0] - centerPoint[0], -(connectionPoint[1] - centerPoint[1])];
        const a = rectangle.width / 4;
        const b = rectangle.height / 2;
        const slope = getTangentSlope(point[0], point[1], a, b) as any;
        return getVectorBySlope(point[0], point[1], slope);
    },
    getConnectorPoints(rectangle: RectangleClient) {
        return RectangleClient.getEdgeCenterPoints(rectangle);
    }
};
