import {
    PlaitBoard,
    Point,
    PointOfRectangle,
    RectangleClient,
    SVGArcCommand,
    W,
    distanceBetweenPointAndPoint,
    getEllipseTangentSlope,
    getNearestPointBetweenPointAndDiscreteSegments,
    getNearestPointBetweenPointAndEllipse,
    getNearestPointBetweenPointAndSegment,
    getNearestPointBetweenPointAndSegments,
    getVectorFromPointAndSlope,
    setStrokeLinecap
} from '@plait/core';
import { PlaitGeometry, ShapeEngine } from '../../interfaces';
import { Options } from 'roughjs/bin/core';
import { getPolygonEdgeByConnectionPoint } from '../../utils/polygon';
import { RectangleEngine } from '../basic-shapes/rectangle';
import { getUnitVectorByPointAndPoint, rotateVector } from '@plait/common';

interface ActorPathData {
    headArcCommand: SVGArcCommand;
    bodyLine: [Point, Point];
    armsLine: [Point, Point];
    leftLegLine: [Point, Point];
    rightLegLine: [Point, Point];
}

function generateActorPath(rectangle: RectangleClient): ActorPathData {
    const centerX = rectangle.x + rectangle.width / 2;
    const headRadius = { width: rectangle.width / 3 / 2, height: rectangle.height / 4 / 2 };
    const centerY = rectangle.y + rectangle.height / 4 / 2;

    return {
        headArcCommand: {
            rx: headRadius.width,
            ry: headRadius.height,
            xAxisRotation: 0,
            largeArcFlag: 0,
            sweepFlag: 1,
            endX: centerX,
            endY: rectangle.y
        },
        bodyLine: [
            [centerX, rectangle.y + rectangle.height / 4],
            [centerX, rectangle.y + (rectangle.height / 4) * 3]
        ],
        armsLine: [
            [rectangle.x, rectangle.y + rectangle.height / 2],
            [rectangle.x + rectangle.width, rectangle.y + rectangle.height / 2]
        ],
        leftLegLine: [
            [centerX, rectangle.y + (rectangle.height / 4) * 3],
            [rectangle.x + rectangle.width / 12, rectangle.y + rectangle.height]
        ],
        rightLegLine: [
            [centerX, rectangle.y + (rectangle.height / 4) * 3],
            [rectangle.x + (rectangle.width / 12) * 11, rectangle.y + rectangle.height]
        ]
    };
}

export const ActorEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        const rs = PlaitBoard.getRoughSVG(board);
        const { headArcCommand, bodyLine, armsLine, leftLegLine, rightLegLine } = generateActorPath(rectangle);

        const pathData = [
            // 头部（从中间开始画）
            `M${bodyLine[0][0]} ${bodyLine[0][1]}`,
            `A${headArcCommand.rx} ${headArcCommand.ry} ${headArcCommand.xAxisRotation} ${headArcCommand.largeArcFlag} ${headArcCommand.sweepFlag} ${headArcCommand.endX} ${headArcCommand.endY}`,
            `A${headArcCommand.rx} ${headArcCommand.ry} ${headArcCommand.xAxisRotation} ${headArcCommand.largeArcFlag} ${headArcCommand.sweepFlag} ${bodyLine[0][0]} ${bodyLine[0][1]}`,
            // 身体
            `V${bodyLine[1][1]}`,
            // 手臂
            `M${armsLine[0][0]} ${armsLine[0][1]} H${armsLine[1][0]}`,
            // 腿
            `M${leftLegLine[0][0]} ${leftLegLine[0][1]} L${leftLegLine[1][0]} ${leftLegLine[1][1]}`,
            `M${rightLegLine[0][0]} ${rightLegLine[0][1]} L${rightLegLine[1][0]} ${rightLegLine[1][1]}`
        ].join(' ');

        const shape = rs.path(pathData, { ...options, fillStyle: 'solid' });
        setStrokeLinecap(shape, 'round');
        return shape;
    },

    getNearestPoint(rectangle: RectangleClient, point: Point) {
        const { headArcCommand, bodyLine, armsLine, leftLegLine, rightLegLine } = generateActorPath(rectangle);

        // 检查头部椭圆
        const headCenter: Point = [rectangle.x + rectangle.width / 2, rectangle.y + rectangle.height / 4 / 2];
        const nearestPointForHead = getNearestPointBetweenPointAndEllipse(point, headCenter, headArcCommand.rx, headArcCommand.ry);
        const distanceForHead = distanceBetweenPointAndPoint(...point, ...nearestPointForHead);

        // 检查所有线段
        const allSegments = [bodyLine, armsLine, leftLegLine, rightLegLine];
        const nearestPointForLines = getNearestPointBetweenPointAndDiscreteSegments(point, allSegments);
        const distanceForLines = distanceBetweenPointAndPoint(...point, ...nearestPointForLines);

        return distanceForHead < distanceForLines ? nearestPointForHead : nearestPointForLines;
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
