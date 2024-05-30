import {
    PlaitBoard,
    Point,
    PointOfRectangle,
    RectangleClient,
    getEllipseTangentSlope,
    getNearestPointBetweenPointAndEllipse,
    getNearestPointBetweenPointAndSegments,
    getVectorFromPointAndSlope,
    isPointInEllipse,
    isPointInPolygon,
    setStrokeLinecap
} from '@plait/core';
import { PlaitGeometry, ShapeEngine } from '../../interfaces';
import { Options } from 'roughjs/bin/core';
import { getStrokeWidthByElement } from '../../utils';

export const getDisplayPoints = (rectangle: RectangleClient): Point[] => {
    return [
        [rectangle.x, rectangle.y + rectangle.height / 2],
        [rectangle.x + rectangle.width * 0.15, rectangle.y],
        [rectangle.x + rectangle.width, rectangle.y],
        [rectangle.x + rectangle.width, rectangle.y + rectangle.height],
        [rectangle.x + rectangle.width * 0.15, rectangle.y + rectangle.height]
    ];
};

export const DisplayEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        const rs = PlaitBoard.getRoughSVG(board);
        const shape = rs.path(
            `M${rectangle.x + rectangle.width * 0.15} ${rectangle.y} 
            H${rectangle.x + rectangle.width - rectangle.width * 0.1} 
            A ${rectangle.width * 0.1} ${rectangle.height / 2}, 0, 0, 1,${rectangle.x +
                rectangle.width -
                rectangle.width * 0.1} ${rectangle.y + rectangle.height}
            H${rectangle.x + rectangle.width * 0.15}
            L${rectangle.x} ${rectangle.y + rectangle.height / 2}
            Z
            `,
            { ...options, fillStyle: 'solid' }
        );
        setStrokeLinecap(shape, 'round');

        return shape;
    },
    isInsidePoint(rectangle: RectangleClient, point: Point) {
        const polygonPoints: Point[] = [
            [rectangle.x, rectangle.y + rectangle.height / 2],
            [rectangle.x + rectangle.width * 0.15, rectangle.y],
            [rectangle.x + rectangle.width - rectangle.width * 0.1, rectangle.y],
            [rectangle.x + rectangle.width - rectangle.width * 0.1, rectangle.y + rectangle.height],
            [rectangle.x + rectangle.width * 0.15, rectangle.y + rectangle.height]
        ];
        const isInPolygon = isPointInPolygon(point, polygonPoints);
        const isInEllipse = isPointInEllipse(
            point,
            [rectangle.x + rectangle.width - rectangle.width * 0.1, rectangle.y + rectangle.height / 2],
            rectangle.width * 0.1,
            rectangle.height / 2
        );
        return isInPolygon || isInEllipse;
    },
    getCornerPoints(rectangle: RectangleClient) {
        return RectangleClient.getCornerPoints(rectangle);
    },
    getNearestPoint(rectangle: RectangleClient, point: Point) {
        const nearestPoint = getNearestPointBetweenPointAndSegments(point, getDisplayPoints(rectangle));
        if (nearestPoint[0] > rectangle.x + rectangle.width - rectangle.width * 0.1) {
            return getNearestPointBetweenPointAndEllipse(
                point,
                [rectangle.x + rectangle.width - rectangle.width * 0.1, rectangle.y + rectangle.height / 2],
                rectangle.width * 0.1,
                rectangle.height / 2
            );
        }
        return nearestPoint;
    },
    getTangentVectorByConnectionPoint(rectangle: RectangleClient, pointOfRectangle: PointOfRectangle) {
        const connectionPoint = RectangleClient.getConnectionPoint(rectangle, pointOfRectangle);
        const centerPoint: Point = [rectangle.x + rectangle.width - rectangle.width * 0.1, rectangle.y + rectangle.height / 2];
        const point = [connectionPoint[0] - centerPoint[0], -(connectionPoint[1] - centerPoint[1])];
        const a = rectangle.width * 0.1;
        const b = rectangle.height / 2;
        const slope = getEllipseTangentSlope(point[0], point[1], a, b) as any;
        return getVectorFromPointAndSlope(point[0], point[1], slope);
    },

    getConnectorPoints(rectangle: RectangleClient) {
        return RectangleClient.getEdgeCenterPoints(rectangle);
    },
    getTextRectangle: (element: PlaitGeometry) => {
        const elementRectangle = RectangleClient.getRectangleByPoints(element.points!);
        const strokeWidth = getStrokeWidthByElement(element);
        const height = element.textHeight!;
        const width = elementRectangle.width - strokeWidth * 2 - elementRectangle.width * 0.25;
        return {
            width: width > 0 ? width : 0,
            height: height,
            x: elementRectangle.x + strokeWidth + elementRectangle.width * 0.15,
            y: elementRectangle.y + (elementRectangle.height - height) / 2
        };
    }
};
