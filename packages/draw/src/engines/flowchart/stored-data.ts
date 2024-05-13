import {
    PlaitBoard,
    Point,
    PointOfRectangle,
    RectangleClient,
    Vector,
    getEllipseTangentSlope,
    getNearestPointBetweenPointAndSegments,
    getVectorFromPointAndSlope,
    isPointInEllipse,
    setStrokeLinecap,
    getNearestPointBetweenPointAndEllipse,
} from '@plait/core';
import { PlaitGeometry, ShapeEngine } from '../../interfaces';
import { Options } from 'roughjs/bin/core';
import { RectangleEngine } from '../basic-shapes/rectangle';
import { getTextRectangle } from '../../utils';

export const StoredDataEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        const rs = PlaitBoard.getRoughSVG(board);
        const shape = rs.path(
            `M${rectangle.x + rectangle.width / 10} ${rectangle.y} L${rectangle.x + rectangle.width} ${rectangle.y} A  ${rectangle.width /
                10} ${rectangle.height / 2}, 0, 0, 0,${rectangle.x + rectangle.width} ${rectangle.y + rectangle.height} L${rectangle.x +
                rectangle.width / 10} ${rectangle.y + rectangle.height}A  ${rectangle.width / 10} ${rectangle.height /
                2}, 0, 0, 1,${rectangle.x + rectangle.width / 10} ${rectangle.y}`,
            { ...options, fillStyle: 'solid' }
        );
        setStrokeLinecap(shape, 'round');
        return shape;
    },
    isInsidePoint(rectangle: RectangleClient, point: Point) {
        //split shape to rectangle and a half ellipse
        const rangeRectangle = RectangleClient.getRectangleByPoints([point, point]);
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
            const centerPoint = [rectangle.x + rectangle.width / 10, rectangle.y + rectangle.height / 2] as Point;
            const nearestPoint = getNearestPointBetweenPointAndEllipse(point, centerPoint, rectangle.width / 10, rectangle.height / 2);
            if (nearestPoint[0] > centerPoint[0]) {
                nearestPoint[0] = centerPoint[0] * 2 - nearestPoint[0];
            }
            return nearestPoint;
        }
        if (nearestPoint[0] > rectangle.x + (rectangle.width * 9) / 10) {
            const centerPoint = [rectangle.x + rectangle.width, rectangle.y + rectangle.height / 2] as Point;
            const nearestPoint = getNearestPointBetweenPointAndEllipse(point, centerPoint, rectangle.width / 10, rectangle.height / 2);
            if (nearestPoint[0] > centerPoint[0]) {
                nearestPoint[0] = centerPoint[0] * 2 - nearestPoint[0];
            }
            return nearestPoint;
        }
        return nearestPoint;
    },
    getTangentVectorByConnectionPoint(rectangle: RectangleClient, pointOfRectangle: PointOfRectangle) {
        const connectionPoint = RectangleClient.getConnectionPoint(rectangle, pointOfRectangle);
        let centerPoint = [rectangle.x + rectangle.width / 10, rectangle.y + rectangle.height / 2];
        let a = rectangle.width / 10;
        let b = rectangle.height / 2;
        const isBackEllipse = connectionPoint[0] > rectangle.x + (rectangle.width * 9) / 10 && connectionPoint[1] > rectangle.y;
        if (isBackEllipse) {
            centerPoint = [rectangle.x + rectangle.width, rectangle.y + rectangle.height / 2];
        }
        const point = [connectionPoint[0] - centerPoint[0], -(connectionPoint[1] - centerPoint[1])];
        const slope = getEllipseTangentSlope(point[0], point[1], a, b) as any;
        const vector = getVectorFromPointAndSlope(point[0], point[1], slope);
        return isBackEllipse ? (vector.map(num => -num) as Vector) : vector;
    },
    getConnectorPoints(rectangle: RectangleClient) {
        return [
            [rectangle.x + rectangle.width / 2, rectangle.y],
            [rectangle.x + (rectangle.width * 9) / 10, rectangle.y + rectangle.height / 2],
            [rectangle.x + rectangle.width / 2, rectangle.y + rectangle.height],
            [rectangle.x, rectangle.y + rectangle.height / 2]
        ];
    },
    getTextRectangle(element: PlaitGeometry) {
        const rectangle = getTextRectangle(element);
        const width = rectangle.width;
        rectangle.width = (rectangle.width * 3) / 4;
        rectangle.x += width / 8;
        return rectangle;
    }
};
