import {
    Direction,
    PlaitBoard,
    Point,
    PointOfRectangle,
    RectangleClient,
    catmullRomFitting,
    distanceBetweenPointAndPoint,
    getNearestPointBetweenPointAndSegments,
    setStrokeLinecap
} from '@plait/core';
import { getDirectionByPointOfRectangle, getDirectionFactor, getUnitVectorByPointAndPoint } from '@plait/common';
import { PlaitGeometry, ShapeEngine } from '../../interfaces';
import { Options } from 'roughjs/bin/core';
import { getStrokeWidthByElement } from '../../utils';
import { ShapeDefaultSpace } from '../../constants';
import { pointsOnBezierCurves } from 'points-on-curve';
import { getCrossingPointBetweenPointAndPolygon } from '../../utils/polygon';

export const getMultiDocumentPoints = (rectangle: RectangleClient): Point[] => {
    const linePoints: Point[] = [
        [rectangle.x, rectangle.y + 10],
        [rectangle.x + 5, rectangle.y + 10],
        [rectangle.x + 5, rectangle.y + 5],
        [rectangle.x + 10, rectangle.y + 5],
        [rectangle.x + 10, rectangle.y],
        [rectangle.x + rectangle.width, rectangle.y],
        [rectangle.x + rectangle.width, rectangle.y + rectangle.height - rectangle.height / 9 - 10 - 3],
        [rectangle.x + rectangle.width - 5, rectangle.y + rectangle.height - rectangle.height / 9 - 10 - 3 - 4],
        [rectangle.x + rectangle.width - 5, rectangle.y + rectangle.height - rectangle.height / 9 - 5 - 3],
        [rectangle.x + rectangle.width - 10, rectangle.y + rectangle.height - rectangle.height / 9 - 5 - 3 - 4],
        [rectangle.x + rectangle.width - 10, rectangle.y + rectangle.height - rectangle.height / 9]
    ];

    let curvePoints = catmullRomFitting([
        [rectangle.x + rectangle.width - 10, rectangle.y + rectangle.height - rectangle.height / 9],
        [rectangle.x + rectangle.width - 10 - (rectangle.width - 10) / 4, rectangle.y + rectangle.height - (rectangle.height / 9) * 2],
        [rectangle.x + (rectangle.width - 10) / 2, rectangle.y + rectangle.height - rectangle.height / 9],
        [rectangle.x + (rectangle.width - 10) / 4, rectangle.y + rectangle.height],
        [rectangle.x, rectangle.y + rectangle.height - rectangle.height / 9]
    ]);

    curvePoints = pointsOnBezierCurves(curvePoints) as Point[];
    return [...linePoints, ...curvePoints];
};

export const MultiDocumentEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        const rs = PlaitBoard.getRoughSVG(board);
        const shape = rs.path(
            `M${rectangle.x} ${rectangle.y + rectangle.height - rectangle.height / 9} V${rectangle.y + 10} H${rectangle.x +
                5} V${rectangle.y + 5} H${rectangle.x + 10} V${rectangle.y} H${rectangle.x + rectangle.width} V${rectangle.y +
                rectangle.height -
                rectangle.height / 9 -
                10 -
                3} L${rectangle.x + rectangle.width - 5} ${rectangle.y +
                rectangle.height -
                rectangle.height / 9 -
                10 -
                3 -
                4} V${rectangle.y + rectangle.height - rectangle.height / 9 - 5 - 3}
                 L${rectangle.x + rectangle.width - 10} ${rectangle.y +
                rectangle.height -
                rectangle.height / 9 -
                5 -
                3 -
                4} V${rectangle.y + rectangle.height - rectangle.height / 9}
                
             Q${rectangle.x + rectangle.width - 10 - (rectangle.width - 10) / 4} ${rectangle.y +
                rectangle.height -
                (rectangle.height / 9) * 3}, ${rectangle.x + (rectangle.width - 10) / 2} ${rectangle.y +
                rectangle.height -
                rectangle.height / 9} T${rectangle.x} ${rectangle.y + rectangle.height - rectangle.height / 9}
              
                M${rectangle.x + 5} ${rectangle.y + 10} H${rectangle.x + rectangle.width - 10} V${rectangle.y +
                rectangle.height -
                rectangle.height / 9} 
                    
                M${rectangle.x + 10} ${rectangle.y + 5} H${rectangle.x + rectangle.width - 5} V${rectangle.y +
                rectangle.height -
                rectangle.height / 9 -
                10 -
                3}
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
        return getNearestPointBetweenPointAndSegments(point, getMultiDocumentPoints(rectangle), false);
    },

    getConnectorPoints(rectangle: RectangleClient) {
        let curvePoints = catmullRomFitting([
            [rectangle.x, rectangle.y + rectangle.height - rectangle.height / 9],
            [rectangle.x + (rectangle.width - 10) / 4, rectangle.y + rectangle.height],
            [rectangle.x + (rectangle.width - 10) / 2, rectangle.y + rectangle.height - rectangle.height / 9],
            [rectangle.x + ((rectangle.width - 10) / 4) * 3, rectangle.y + rectangle.height - (rectangle.height / 9) * 2],
            [rectangle.x + rectangle.width - 10, rectangle.y + rectangle.height - rectangle.height / 9]
        ]);
        curvePoints = pointsOnBezierCurves(curvePoints) as Point[];
        const crossingPoint = getNearestPointBetweenPointAndSegments(
            [rectangle.x + rectangle.width / 2, rectangle.y + rectangle.height],
            curvePoints
        );
        return [
            [rectangle.x + rectangle.width / 2, rectangle.y],
            [rectangle.x + rectangle.width, rectangle.y + rectangle.height / 2],
            [crossingPoint[0], crossingPoint[1]],
            [rectangle.x, rectangle.y + rectangle.height / 2]
        ];
    },

    getNearestCrossingPoint(rectangle: RectangleClient, point: Point) {
        const crossingPoints = getCrossingPointBetweenPointAndPolygon(getMultiDocumentPoints(rectangle), point);
        let nearestPoint = crossingPoints[0];
        let nearestDistance = distanceBetweenPointAndPoint(point[0], point[1], nearestPoint[0], nearestPoint[1]);
        crossingPoints
            .filter((v, index) => index > 0)
            .forEach(crossingPoint => {
                let distance = distanceBetweenPointAndPoint(point[0], point[1], crossingPoint[0], crossingPoint[1]);
                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestPoint = crossingPoint;
                }
            });

        return nearestPoint;
    },

    getTangentVectorByConnectionPoint(rectangle: RectangleClient, pointOfRectangle: PointOfRectangle) {
        const connectionPoint = RectangleClient.getConnectionPoint(rectangle, pointOfRectangle);
        if (connectionPoint[0] > rectangle.x && connectionPoint[0] < rectangle.x + (rectangle.width - 10) / 4) {
            return getUnitVectorByPointAndPoint(
                [rectangle.x + (rectangle.width - 10) / 4, rectangle.y + rectangle.height],
                connectionPoint
            );
        }
        if (
            connectionPoint[0] > rectangle.x + (rectangle.width - 10) / 4 &&
            connectionPoint[0] < rectangle.x + ((rectangle.width - 10) / 4) * 3
        ) {
            return getUnitVectorByPointAndPoint(
                [rectangle.x + ((rectangle.width - 10) / 4) * 3, rectangle.y + rectangle.height - rectangle.height / 9],
                [rectangle.x + (rectangle.width - 10) / 4, rectangle.y + rectangle.height]
            );
        }

        if (
            connectionPoint[0] > rectangle.x + ((rectangle.width - 10) / 4) * 3 &&
            connectionPoint[0] < rectangle.x + rectangle.width - 10
        ) {
            return getUnitVectorByPointAndPoint(
                [rectangle.x + (rectangle.width - 10), rectangle.y + rectangle.height - rectangle.height / 9],
                connectionPoint
            );
        }
        const direction = getDirectionByPointOfRectangle(pointOfRectangle) || Direction.bottom;
        const factor = getDirectionFactor(direction!);
        return [factor.x, factor.y];
    },

    getTextRectangle: (element: PlaitGeometry) => {
        const elementRectangle = RectangleClient.getRectangleByPoints(element.points!);
        const strokeWidth = getStrokeWidthByElement(element);
        const height = element.textHeight!;
        const width = elementRectangle.width - ShapeDefaultSpace.rectangleAndText * 2 - strokeWidth * 2 - elementRectangle.width * 0.06 * 2;
        return {
            height,
            width: width > 0 ? width - 10 : 0,
            x: elementRectangle.x + ShapeDefaultSpace.rectangleAndText + strokeWidth + elementRectangle.width * 0.06,
            y: elementRectangle.y + (elementRectangle.height - height) / 2
        };
    }
};
