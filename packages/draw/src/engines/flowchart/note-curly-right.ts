import { PlaitBoard, Point, PointOfRectangle, RectangleClient, distanceBetweenPointAndPoint, setStrokeLinecap } from '@plait/core';
import { PlaitGeometry, ShapeEngine } from '../../interfaces';
import { ShapeDefaultSpace } from '../../constants';
import { Options } from 'roughjs/bin/core';
import { RectangleEngine } from '../basic-shapes/rectangle';
import { getPolygonEdgeByConnectionPoint } from '../../utils/polygon';
import { getStrokeWidthByElement, getCustomTextRectangle } from '../../utils';
import { pointsOnBezierCurves } from 'points-on-curve';

interface NoteCurlyRightPathData {
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

function generateNoteCurlyRightPath(rectangle: RectangleClient): NoteCurlyRightPathData {
    const curlyWidth = rectangle.width * 0.09;
    const centerY = rectangle.y + rectangle.height / 2;

    return {
        startPoint: [rectangle.x, rectangle.y],
        upperCurve: {
            controlPoint1: [rectangle.x + curlyWidth, rectangle.y],
            controlPoint2: [rectangle.x, centerY],
            endPoint: [rectangle.x + curlyWidth, centerY]
        },
        lowerCurve: {
            controlPoint1: [rectangle.x, centerY],
            controlPoint2: [rectangle.x + curlyWidth, rectangle.y + rectangle.height],
            endPoint: [rectangle.x, rectangle.y + rectangle.height]
        }
    };
}

export const NoteCurlyRightEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        const rs = PlaitBoard.getRoughSVG(board);
        const { startPoint, upperCurve, lowerCurve } = generateNoteCurlyRightPath(rectangle);

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
    isInsidePoint(rectangle: RectangleClient, point: Point) {
        const rangeRectangle = RectangleClient.getRectangleByPoints([point, point]);
        return RectangleClient.isHit(rectangle, rangeRectangle);
    },
    getCornerPoints(rectangle: RectangleClient) {
        return RectangleClient.getCornerPoints(rectangle);
    },
    getNearestPoint(rectangle: RectangleClient, point: Point) {
        const { startPoint, upperCurve, lowerCurve } = generateNoteCurlyRightPath(rectangle);

        // 生成上部贝塞尔曲线的点
        const upperBezierPoints = pointsOnBezierCurves(
            [startPoint, upperCurve.controlPoint1, upperCurve.controlPoint2, upperCurve.endPoint],
            0.001
        );

        // 生成下部贝塞尔曲线的点
        const lowerBezierPoints = pointsOnBezierCurves(
            [upperCurve.endPoint, lowerCurve.controlPoint1, lowerCurve.controlPoint2, lowerCurve.endPoint],
            0.001
        );

        // 合并所有点
        const allPoints = [...upperBezierPoints, ...lowerBezierPoints];

        // 找到最近的点
        let minDistance = Infinity;
        let nearestPoint = [...point] as Point;

        for (const curvePoint of allPoints) {
            const distance = distanceBetweenPointAndPoint(point[0], point[1], curvePoint[0], curvePoint[1]);
            if (distance < minDistance) {
                minDistance = distance;
                nearestPoint = [...curvePoint];
            }
        }

        return nearestPoint;
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
        const textRectangle = getCustomTextRectangle(board, element, 0.9);
        textRectangle.x =
            elementRectangle.x + getStrokeWidthByElement(element) + ShapeDefaultSpace.rectangleAndText + elementRectangle.width * 0.1;
        return textRectangle;
    }
};
