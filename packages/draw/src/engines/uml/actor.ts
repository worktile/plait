import {
    PlaitBoard,
    Point,
    PointOfRectangle,
    RectangleClient,
    W,
    getEllipseTangentSlope,
    getNearestPointBetweenPointAndEllipse,
    getNearestPointBetweenPointAndSegments,
    getVectorFromPointAndSlope,
    setStrokeLinecap
} from '@plait/core';
import { PlaitGeometry, ShapeEngine } from '../../interfaces';
import { Options } from 'roughjs/bin/core';
import { getPolygonEdgeByConnectionPoint } from '../../utils/polygon';
import { RectangleEngine } from '../basic-shapes/rectangle';
import { getUnitVectorByPointAndPoint, rotateVector } from '@plait/common';

export const ActorEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        const rs = PlaitBoard.getRoughSVG(board);
        const shape = rs.path(
            `M${rectangle.x + rectangle.width / 2} ${rectangle.y + rectangle.height / 4}  
            A${rectangle.width / 3 / 2} ${rectangle.height / 4 / 2}, 0, 0, 1, ${rectangle.x + rectangle.width / 2} ${rectangle.y} 
            A${rectangle.width / 3 / 2} ${rectangle.height / 4 / 2}, 0, 0, 1, ${rectangle.x + rectangle.width / 2} ${rectangle.y +
                rectangle.height / 4}
            V${rectangle.y + (rectangle.height / 4) * 3}
            M${rectangle.x + rectangle.width / 2} ${rectangle.y + rectangle.height / 2} H${rectangle.x}
            M${rectangle.x + rectangle.width / 2} ${rectangle.y + rectangle.height / 2} H${rectangle.x + rectangle.width}
            M${rectangle.x + rectangle.width / 2} ${rectangle.y + (rectangle.height / 4) * 3}
            L${rectangle.x + rectangle.width / 12} ${rectangle.y + rectangle.height}
            M${rectangle.x + rectangle.width / 2} ${rectangle.y + (rectangle.height / 4) * 3}
            L${rectangle.x + (rectangle.width / 12) * 11} ${rectangle.y + rectangle.height}
            `,
            { ...options, fillStyle: 'solid' }
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
    getNearestPoint(rectangle: RectangleClient, point: Point) {
        let nearestPoint = getNearestPointBetweenPointAndSegments(point, RectangleEngine.getCornerPoints(rectangle));

        if (nearestPoint[1] >= rectangle.y && nearestPoint[1] <= rectangle.y + rectangle.height / 4) {
            const centerPoint: Point = [rectangle.x + rectangle.width / 2, rectangle.y + rectangle.height / 4 / 2];
            nearestPoint = getNearestPointBetweenPointAndEllipse(point, centerPoint, rectangle.width / 3 / 2, rectangle.height / 4 / 2);
            return nearestPoint;
        }
        if (nearestPoint[1] >= rectangle.y + rectangle.height / 4 && nearestPoint[1] < rectangle.y + (rectangle.height / 4) * 3) {
            if (nearestPoint[1] === rectangle.x + rectangle.width / 2) {
                nearestPoint = getNearestPointBetweenPointAndSegments(point, [
                    [rectangle.x + rectangle.width / 2, rectangle.y + rectangle.height / 4],
                    [rectangle.x + rectangle.width / 2, rectangle.y + (rectangle.height / 4) * 3]
                ]);
            } else {
                nearestPoint = getNearestPointBetweenPointAndSegments(point, [
                    [rectangle.x, rectangle.y + rectangle.height / 2],
                    [rectangle.x + rectangle.width, rectangle.y + rectangle.height / 2]
                ]);
            }
            return nearestPoint;
        }
        nearestPoint = getNearestPointBetweenPointAndSegments(point, [
            [rectangle.x + rectangle.width / 12, rectangle.y + rectangle.height],
            [rectangle.x + rectangle.width / 2, rectangle.y + (rectangle.height / 4) * 3],
            [rectangle.x + (rectangle.width / 12) * 11, rectangle.y + rectangle.height]
        ]);
        return nearestPoint;
    },
    getConnectorPoints(rectangle: RectangleClient) {
        return RectangleClient.getEdgeCenterPoints(rectangle);
    },

    getTangentVectorByConnectionPoint(rectangle: RectangleClient, pointOfRectangle: PointOfRectangle) {
        const connectionPoint = RectangleClient.getConnectionPoint(rectangle, pointOfRectangle);
        if (connectionPoint[1] >= rectangle.y && connectionPoint[1] <= rectangle.y + rectangle.height / 4) {
            const centerPoint: Point = [rectangle.x + rectangle.width / 2, rectangle.y + rectangle.height / 4 / 2];
            const point = [connectionPoint[0] - centerPoint[0], -(connectionPoint[1] - centerPoint[1])];
            const a = rectangle.width / 2;
            const b = rectangle.height / 2;
            const slope = getEllipseTangentSlope(point[0], point[1], a, b) as any;
            const vector = getVectorFromPointAndSlope(point[0], point[1], slope);
            return vector;
        }

        if (connectionPoint[1] >= rectangle.y + rectangle.height / 4 && connectionPoint[1] < rectangle.y + (rectangle.height / 4) * 3) {
            if (connectionPoint[0] < rectangle.x + rectangle.width / 2) {
                return rotateVector(
                    getUnitVectorByPointAndPoint([rectangle.x, rectangle.y + rectangle.height / 2], connectionPoint),
                    -(Math.PI / 2)
                );
            } else {
                return rotateVector(
                    getUnitVectorByPointAndPoint([rectangle.x + rectangle.width, rectangle.y + rectangle.height / 2], connectionPoint),
                    -(Math.PI / 2)
                );
            }
        }

        if (connectionPoint[1] >= rectangle.y + (rectangle.height / 4) * 3) {
            if (connectionPoint[0] < rectangle.x + rectangle.width / 2) {
                return getUnitVectorByPointAndPoint(connectionPoint, [rectangle.x + rectangle.width / 12, rectangle.y + rectangle.height]);
            } else {
                return getUnitVectorByPointAndPoint(
                    [rectangle.x + (rectangle.width / 12) * 11, rectangle.y + rectangle.height],
                    connectionPoint
                );
            }
        }

        return getUnitVectorByPointAndPoint(connectionPoint, [rectangle.x + rectangle.width / 4, rectangle.y + rectangle.height]);
    },
    getTextRectangle: (element: PlaitGeometry) => {
        const elementRectangle = RectangleClient.getRectangleByPoints(element.points!);
        const height = element.textHeight!;
        const width = elementRectangle.width + 40;
        return {
            height,
            width: width > 0 ? width : 0,
            x: elementRectangle.x - 20,
            y: elementRectangle.y + elementRectangle.height + 4
        };
    }
};
