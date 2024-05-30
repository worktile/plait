import {
    PlaitBoard,
    Point,
    PointOfRectangle,
    RectangleClient,
    catmullRomFitting,
    getNearestPointBetweenPointAndSegments,
    setStrokeLinecap
} from '@plait/core';
import { getUnitVectorByPointAndPoint } from '@plait/common';
import { PlaitGeometry, ShapeEngine } from '../../interfaces';
import { Options } from 'roughjs/bin/core';
import { RectangleEngine } from '../basic-shapes/rectangle';
import { getStrokeWidthByElement } from '../../utils';
import { ShapeDefaultSpace } from '../../constants';
import { pointsOnBezierCurves } from 'points-on-curve';

export const DocumentEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        const rs = PlaitBoard.getRoughSVG(board);
        const shape = rs.path(
            `M${rectangle.x} ${rectangle.y + rectangle.height - rectangle.height / 9} V${rectangle.y} H${rectangle.x +
                rectangle.width} V${rectangle.y + rectangle.height - rectangle.height / 9}
            Q${rectangle.x + rectangle.width - rectangle.width / 4} ${rectangle.y +
                rectangle.height -
                (rectangle.height / 9) * 3}, ${rectangle.x + rectangle.width / 2} ${rectangle.y +
                rectangle.height -
                rectangle.height / 9} T${rectangle.x} ${rectangle.y + rectangle.height - rectangle.height / 9}           
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
        let curvePoints = catmullRomFitting([
            [rectangle.x, rectangle.y + rectangle.height - rectangle.height / 9],
            [rectangle.x + rectangle.width / 4, rectangle.y + rectangle.height],
            [rectangle.x + rectangle.width / 2, rectangle.y + rectangle.height - rectangle.height / 9],
            [rectangle.x + (rectangle.width / 4) * 3, rectangle.y + rectangle.height - (rectangle.height / 9) * 2],
            [rectangle.x + rectangle.width, rectangle.y + rectangle.height - rectangle.height / 9]
        ]);
        curvePoints = pointsOnBezierCurves(curvePoints) as Point[];
        if (nearestPoint[1] > rectangle.y + rectangle.height - rectangle.height / 9) {
            if (nearestPoint[0] === rectangle.x + rectangle.width / 2) {
                nearestPoint[1] = rectangle.y + rectangle.height - rectangle.height / 9;
                return nearestPoint;
            }
            nearestPoint = getNearestPointBetweenPointAndSegments(point, curvePoints, false);
        }

        return nearestPoint;
    },

    getConnectorPoints(rectangle: RectangleClient) {
        return [
            [rectangle.x + rectangle.width / 2, rectangle.y],
            [rectangle.x + rectangle.width, rectangle.y + rectangle.height / 2],
            [rectangle.x + rectangle.width / 2, rectangle.y + rectangle.height - rectangle.height / 9],
            [rectangle.x, rectangle.y + rectangle.height / 2]
        ];
    },

    getTangentVectorByConnectionPoint(rectangle: RectangleClient, pointOfRectangle: PointOfRectangle) {
        const connectionPoint = RectangleClient.getConnectionPoint(rectangle, pointOfRectangle);
        if (connectionPoint[0] > rectangle.x && connectionPoint[0] < rectangle.x + rectangle.width / 4) {
            return getUnitVectorByPointAndPoint([rectangle.x + rectangle.width / 4, rectangle.y + rectangle.height], connectionPoint);
        }

        if (connectionPoint[0] > rectangle.x + rectangle.width / 4 && connectionPoint[0] < rectangle.x + (rectangle.width / 4) * 3) {
            return getUnitVectorByPointAndPoint(
                [rectangle.x + (rectangle.width / 4) * 3, rectangle.y + rectangle.height - rectangle.height / 9],
                [rectangle.x + rectangle.width / 4, rectangle.y + rectangle.height]
            );
        }

        if (connectionPoint[0] > rectangle.x + (rectangle.width / 4) * 3) {
            return getUnitVectorByPointAndPoint(
                [rectangle.x + rectangle.width, rectangle.y + rectangle.height - rectangle.height / 9],
                connectionPoint
            );
        }
        return getUnitVectorByPointAndPoint(connectionPoint, [rectangle.x + rectangle.width / 4, rectangle.y + rectangle.height]);
    },

    getTextRectangle: (element: PlaitGeometry) => {
        const elementRectangle = RectangleClient.getRectangleByPoints(element.points!);
        const strokeWidth = getStrokeWidthByElement(element);
        const height = element.textHeight!;
        const width = elementRectangle.width - ShapeDefaultSpace.rectangleAndText * 2 - strokeWidth * 2 - elementRectangle.width * 0.06 * 2;
        return {
            height,
            width: width > 0 ? width : 0,
            x: elementRectangle.x + ShapeDefaultSpace.rectangleAndText + strokeWidth + elementRectangle.width * 0.06,
            y: elementRectangle.y + (elementRectangle.height - height) / 2
        };
    }
};
