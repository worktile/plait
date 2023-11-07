import {
    PlaitBoard,
    Point,
    PointOfRectangle,
    RectangleClient,
    createG,
    createPath,
    getNearestPointBetweenPointAndSegments,
    isPointInEllipse,
    setStrokeLinecap
} from '@plait/core';
import { ShapeEngine } from '../../interfaces';
import { Options } from 'roughjs/bin/core';
import { getEdgeOnPolygonByPoint } from '../../utils/geometry';
import { RectangleEngine } from '../basic-shapes/rectangle';
import { getNearestPointBetweenPointAndEllipse } from '../basic-shapes/ellipse';

export const StoredDataEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        const rs = PlaitBoard.getRoughSVG(board);
        const shape = rs.path(
            `M${rectangle.x + rectangle.width / 10} ${rectangle.y} L${rectangle.x + rectangle.width} ${rectangle.y} A  ${rectangle.width /
                10} ${rectangle.height / 2}, 1, 0, 0,${rectangle.x + rectangle.width} ${rectangle.y + rectangle.height} L${rectangle.x +
                rectangle.width / 10} ${rectangle.y + rectangle.height}A  ${rectangle.width / 10} ${rectangle.height /
                2}, 0, 0, 1,${rectangle.x + rectangle.width / 10} ${rectangle.y}`,
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
                x: rectangle.x + rectangle.width / 10,
                width: (rectangle.width * 9) / 10
            },
            rangeRectangle
        );

        const isInFrontEllipse = isPointInEllipse(
            point,
            [rectangle.x + rectangle.width / 10, rectangle.y + rectangle.height / 2],
            rectangle.width / 10,
            rectangle.height / 2
        );

        const notInBackEllipse = !isPointInEllipse(
            point,
            [rectangle.x + rectangle.width, rectangle.y + rectangle.height / 2],
            rectangle.width / 10,
            rectangle.height / 2
        );
        return (isInRectangle && notInBackEllipse) || isInFrontEllipse;
    },
    getCornerPoints(rectangle: RectangleClient) {
        return RectangleClient.getCornerPoints(rectangle);
    },
    getNearestPoint(rectangle: RectangleClient, point: Point) {
        const nearestPoint = getNearestPointBetweenPointAndSegments(point, RectangleEngine.getCornerPoints(rectangle));
        if (nearestPoint[0] < rectangle.x + rectangle.width / 10) {
            const nearestPoint = getNearestPointBetweenPointAndEllipse(
                point,
                [rectangle.x + rectangle.width / 10, rectangle.y + rectangle.height / 2],
                rectangle.width / 10,
                rectangle.height / 2
            );
            if (nearestPoint[0] < rectangle.x + rectangle.width / 10) {
                return nearestPoint;
            }
        }

        if (nearestPoint[0] > rectangle.x + (rectangle.width * 9) / 10) {
            return getNearestPointBetweenPointAndEllipse(
                point,
                [rectangle.x + rectangle.width, rectangle.y + rectangle.height / 2],
                rectangle.width / 10,
                rectangle.height / 2
            );
        }
        return nearestPoint;
    },
    getEdgeByConnectionPoint(rectangle: RectangleClient, pointOfRectangle: PointOfRectangle): [Point, Point] | null {
        const corners = RectangleEngine.getCornerPoints(rectangle);
        const point = RectangleClient.getConnectionPoint(rectangle, pointOfRectangle);
        return getEdgeOnPolygonByPoint(corners, point);
    },
    // getTangentVectorByConnectionPoint(rectangle: RectangleClient, pointOfRectangle: PointOfRectangle) {
    //     const connectionPoint = RectangleClient.getConnectionPoint(rectangle, pointOfRectangle);
    //     const centerPoint: Point = [rectangle.x + rectangle.width / 2, rectangle.y + rectangle.height / 2];
    //     const point = [connectionPoint[0] - centerPoint[0], -(connectionPoint[1] - centerPoint[1])];
    //     const a = rectangle.width / 2;
    //     const b = rectangle.height / 2;
    //     const slope = getTangentSlope(point[0], point[1], a, b) as any;
    //     return getVectorBySlope(point[0], point[1], slope);
    // },
    getConnectorPoints(rectangle: RectangleClient) {
        return [
            [rectangle.x + rectangle.width / 2, rectangle.y],
            [rectangle.x + (rectangle.width * 9) / 10, rectangle.y + rectangle.height / 2],
            [rectangle.x + rectangle.width / 2, rectangle.y + rectangle.height],
            [rectangle.x, rectangle.y + rectangle.height / 2]
        ];
    }
};
