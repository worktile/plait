import {
    PlaitBoard,
    Point,
    PointOfRectangle,
    RectangleClient,
    getEllipseTangentSlope,
    getNearestPointBetweenPointAndSegments,
    getVectorFromPointAndSlope,
    setStrokeLinecap
} from '@plait/core';
import { ShapeEngine } from '../../interfaces';
import { Options } from 'roughjs/bin/core';
import { RectangleEngine } from '../basic-shapes/rectangle';
import { getUnitVectorByPointAndPoint } from '@plait/common';

export const ProvidedInterfaceEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        const rs = PlaitBoard.getRoughSVG(board);
        const shape = rs.path(
            ` M${rectangle.x} ${rectangle.y + rectangle.height / 2} 
        H${rectangle.x + rectangle.width * 0.54}
        A${(rectangle.width * 0.46) / 2} ${rectangle.height / 2}, 0, 1, 1 ${rectangle.x + rectangle.width} ${rectangle.y +
                rectangle.height / 2}
        A${(rectangle.width * 0.46) / 2} ${rectangle.height / 2}, 0, 1, 1 ${rectangle.x + rectangle.width * 0.54} ${rectangle.y +
                rectangle.height / 2}
        `,
            {
                ...options,
                fillStyle: 'solid'
            }
        );
        setStrokeLinecap(shape, 'round');

        return shape;
    },
    isInsidePoint(rectangle: RectangleClient, point: Point) {
        const rangeRectangle = RectangleClient.getRectangleByPoints([point, point]);
        return RectangleClient.isHit(rectangle, rangeRectangle);
    },
    getCornerPoints(rectangle: RectangleClient) {
        return RectangleClient.getCornerPoints(rectangle);
    },
    getConnectorPoints(rectangle: RectangleClient) {
        return RectangleClient.getEdgeCenterPoints(rectangle);
    },
    getNearestPoint(rectangle: RectangleClient, point: Point) {
        const nearestPoint = getNearestPointBetweenPointAndSegments(point, RectangleEngine.getCornerPoints(rectangle));
        return nearestPoint;
    },
    getTangentVectorByConnectionPoint(rectangle: RectangleClient, pointOfRectangle: PointOfRectangle) {
        const connectionPoint = RectangleClient.getConnectionPoint(rectangle, pointOfRectangle);
        const centerPoint: Point = [rectangle.x + (rectangle.width * 3) / 4, rectangle.y + rectangle.height / 2];
        if (connectionPoint[0] > rectangle.x + rectangle.width * 0.54) {
            const point = [connectionPoint[0] - centerPoint[0], -(connectionPoint[1] - centerPoint[1])];
            const rx = (rectangle.width * 0.46) / 2;
            const ry = rectangle.height / 2;
            const slope = getEllipseTangentSlope(point[0], point[1], rx, ry) as any;
            return getVectorFromPointAndSlope(point[0], point[1], slope);
        }
        return getUnitVectorByPointAndPoint(connectionPoint, [rectangle.x, rectangle.y + rectangle.height / 2]);
    }
};
