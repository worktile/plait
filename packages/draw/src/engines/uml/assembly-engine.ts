import {
    PlaitBoard,
    Point,
    PointOfRectangle,
    RectangleClient,
    getNearestPointBetweenPointAndEllipse,
    getNearestPointBetweenPointAndSegments,
    setStrokeLinecap
} from '@plait/core';
import { ShapeEngine } from '../../interfaces';
import { Options } from 'roughjs/bin/core';
import { RectangleEngine } from '../basic-shapes/rectangle';
import { getUnitVectorByPointAndPoint, rotateVector } from '@plait/common';

export const AssemblyEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        const rs = PlaitBoard.getRoughSVG(board);
        const shape = rs.path(
            `
        M${rectangle.x} ${rectangle.y + rectangle.height / 2} 
        H${rectangle.x + rectangle.width * 0.3}
        A${rectangle.width * 0.13} ${rectangle.height * 0.285}, 0, 1, 1 ${rectangle.x +
                rectangle.width * 0.3 +
                rectangle.width * 0.26} ${rectangle.y + rectangle.height / 2}
        A${rectangle.width * 0.13} ${rectangle.height * 0.285}, 0, 1, 1 ${rectangle.x + rectangle.width * 0.3} ${rectangle.y +
                rectangle.height / 2}
        M${rectangle.x + rectangle.width * 0.3 + rectangle.width * 0.13} ${rectangle.y}
        A${rectangle.width * 0.233} ${rectangle.height / 2}, 0, 0, 1 ${rectangle.x +
                rectangle.width * 0.3 +
                rectangle.width * 0.13} ${rectangle.y + rectangle.height}
        M${rectangle.x + rectangle.width * 0.3 + rectangle.width * 0.13 + rectangle.width * 0.233} ${rectangle.y +
                rectangle.height / 2} H${rectangle.x + rectangle.width}
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
        if (nearestPoint[0] === rectangle.x + rectangle.width / 2) {
            return getNearestPointBetweenPointAndEllipse(
                point,
                [rectangle.x + rectangle.width * 0.43, rectangle.y + rectangle.height / 2],
                rectangle.width * 0.223,
                rectangle.height / 2
            );
        }
        return nearestPoint;
    },
    getTangentVectorByConnectionPoint(rectangle: RectangleClient, pointOfRectangle: PointOfRectangle) {
        const connectionPoint = RectangleClient.getConnectionPoint(rectangle, pointOfRectangle);
        if (connectionPoint[0] > rectangle.x + rectangle.width * 0.43 && connectionPoint[1] < rectangle.y + rectangle.height / 2) {
            return rotateVector(getUnitVectorByPointAndPoint(connectionPoint, [rectangle.x, rectangle.y + rectangle.height / 2]), -Math.PI);
        }
        if (connectionPoint[0] > rectangle.x + rectangle.width * 0.43 && connectionPoint[1] > rectangle.y + rectangle.height / 2) {
            return getUnitVectorByPointAndPoint(connectionPoint, [rectangle.x, rectangle.y + rectangle.height / 2]);
        }
        return getUnitVectorByPointAndPoint(connectionPoint, [rectangle.x, rectangle.y + rectangle.height / 2]);
    }
};
