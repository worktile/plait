import {
    PlaitBoard,
    Point,
    PointOfRectangle,
    RectangleClient,
    distanceBetweenPointAndPoint,
    setStrokeLinecap
} from '@plait/core';
import { getTextSize } from '../../utils/text-size';
import { PlaitGeometry, ShapeEngine } from '../../interfaces';
import { ShapeDefaultSpace } from '../../constants';
import { Options } from 'roughjs/bin/core';
import { RectangleEngine } from '../basic-shapes/rectangle';
import { getPolygonEdgeByConnectionPoint } from '../../utils/polygon';
import { getStrokeWidthByElement } from '../../utils';
import { pointsOnBezierCurves } from 'points-on-curve';

interface NoteCurlyLeftPathData {
    startPoint: Point;
    upperCurve: {
        controlPoint1: Point;
        controlPoint2: Point;
        endPoint: Point;
    };
    lowerCurve: {
        controlPoint1: Point;
        controlPoint2: Point;
        endPoint: Point;
    };
}

function generateNoteCurlyLeftPath(rectangle: RectangleClient): NoteCurlyLeftPathData {
    const curlyWidth = rectangle.width * 0.09;
    const rightX = rectangle.x + rectangle.width;
    const centerY = rectangle.y + rectangle.height / 2;

    return {
        startPoint: [rightX, rectangle.y],
        upperCurve: {
            controlPoint1: [rightX - curlyWidth, rectangle.y],
            controlPoint2: [rightX, centerY],
            endPoint: [rightX - curlyWidth, centerY]
        },
        lowerCurve: {
            controlPoint1: [rightX, centerY],
            controlPoint2: [rightX - curlyWidth, rectangle.y + rectangle.height],
            endPoint: [rightX, rectangle.y + rectangle.height]
        }
    };
}

export const NoteCurlyLeftEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        const rs = PlaitBoard.getRoughSVG(board);
        const { startPoint, upperCurve, lowerCurve } = generateNoteCurlyLeftPath(rectangle);

        const pathData = [
            `M${startPoint[0]} ${startPoint[1]}`,
            `C${upperCurve.controlPoint1[0]} ${upperCurve.controlPoint1[1]},
            ${upperCurve.controlPoint2[0]} ${upperCurve.controlPoint2[1]},
            ${upperCurve.endPoint[0]} ${upperCurve.endPoint[1]}`,
            `C${lowerCurve.controlPoint1[0]} ${lowerCurve.controlPoint1[1]},
            ${lowerCurve.controlPoint2[0]} ${lowerCurve.controlPoint2[1]},
            ${lowerCurve.endPoint[0]} ${lowerCurve.endPoint[1]}`
        ].join(' ');

        const shape = rs.path(pathData, { ...options, fillStyle: 'solid', fill: 'transparent' });
        setStrokeLinecap(shape, 'round');
        return shape;
    },

    getNearestPoint(rectangle: RectangleClient, point: Point) {
        const { startPoint, upperCurve, lowerCurve } = generateNoteCurlyLeftPath(rectangle);

        const upperBezierPoints = pointsOnBezierCurves(
            [startPoint, upperCurve.controlPoint1, upperCurve.controlPoint2, upperCurve.endPoint],
            0.001
        );

        const lowerBezierPoints = pointsOnBezierCurves(
            [upperCurve.endPoint, lowerCurve.controlPoint1, lowerCurve.controlPoint2, lowerCurve.endPoint],
            0.001
        );

        const allPoints = [...upperBezierPoints, ...lowerBezierPoints];

        let minDistance = Infinity;
        let nearestPoint = point;

        for (const curvePoint of allPoints) {
            const distance = distanceBetweenPointAndPoint(point[0], point[1], curvePoint[0], curvePoint[1]);
            if (distance < minDistance) {
                minDistance = distance;
                nearestPoint = [...curvePoint];
            }
        }

        return nearestPoint;
    },
    isInsidePoint(rectangle: RectangleClient, point: Point) {
        const rangeRectangle = RectangleClient.getRectangleByPoints([point, point]);
        return RectangleClient.isHit(rectangle, rangeRectangle);
    },
    getCornerPoints(rectangle: RectangleClient) {
        return RectangleClient.getCornerPoints(rectangle);
    },
    getEdgeByConnectionPoint(rectangle: RectangleClient, pointOfRectangle: PointOfRectangle): [Point, Point] | null {
        const corners = RectangleEngine.getCornerPoints(rectangle);
        const point = RectangleClient.getConnectionPoint(rectangle, pointOfRectangle);
        return getPolygonEdgeByConnectionPoint(corners, point);
    },
    getConnectorPoints(rectangle: RectangleClient) {
        return RectangleClient.getEdgeCenterPoints(rectangle);
    },
    getTextRectangle: (board: PlaitBoard, element: PlaitGeometry) => {
        const elementRectangle = RectangleClient.getRectangleByPoints(element.points!);
        const strokeWidth = getStrokeWidthByElement(element);
        const width = elementRectangle.width - elementRectangle.width * 0.09 - ShapeDefaultSpace.rectangleAndText * 2 - strokeWidth * 2;
        const text = element.text!;
        const textSize = getTextSize(board, text, width);
        return {
            height: textSize.height,
            width: width > 0 ? width : 0,
            x: elementRectangle.x + ShapeDefaultSpace.rectangleAndText + strokeWidth,
            y: elementRectangle.y + (elementRectangle.height - textSize.height) / 2
        };
    }
};
