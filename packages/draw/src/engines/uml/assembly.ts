import {
    PlaitBoard,
    Point,
    PointOfRectangle,
    RectangleClient,
    SVGArcCommand,
    distanceBetweenPointAndPoint,
    getNearestPointBetweenPointAndArc,
    getNearestPointBetweenPointAndEllipse,
    getNearestPointBetweenPointAndSegments,
    setStrokeLinecap
} from '@plait/core';
import { ShapeEngine } from '../../interfaces';
import { Options } from 'roughjs/bin/core';
import { RectangleEngine } from '../basic-shapes/rectangle';
import { getUnitVectorByPointAndPoint, rotateVector } from '@plait/common';

interface AssemblyPathData {
    startPoint: Point;
    line1: [Point, Point];
    circleArcCommand: SVGArcCommand;
    verticalArcCommand: SVGArcCommand;
    line2: [Point, Point];
}

function generateAssemblyPath(rectangle: RectangleClient): AssemblyPathData {
    const centerY = rectangle.y + rectangle.height / 2;
    const firstLineEndX = rectangle.x + rectangle.width * 0.3;
    const circleWidth = rectangle.width * 0.13;
    const circleHeight = rectangle.height * 0.285;
    const verticalX = firstLineEndX + circleWidth;
    const verticalRadius = rectangle.width * 0.233;

    return {
        startPoint: [rectangle.x, centerY],
        line1: [
            [rectangle.x, centerY],
            [firstLineEndX, centerY]
        ],
        circleArcCommand: {
            rx: circleWidth,
            ry: circleHeight,
            xAxisRotation: 0,
            largeArcFlag: 1,
            sweepFlag: 1,
            endX: firstLineEndX,
            endY: centerY
        },
        verticalArcCommand: {
            rx: verticalRadius,
            ry: rectangle.height / 2,
            xAxisRotation: 0,
            largeArcFlag: 0,
            sweepFlag: 1,
            endX: verticalX,
            endY: rectangle.y + rectangle.height
        },
        line2: [
            [verticalX + verticalRadius, centerY],
            [rectangle.x + rectangle.width, centerY]
        ]
    };
}

export const AssemblyEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        const rs = PlaitBoard.getRoughSVG(board);
        const { startPoint, line1, circleArcCommand, verticalArcCommand, line2 } = generateAssemblyPath(rectangle);

        const pathData = [
            `M${startPoint[0]} ${startPoint[1]}`,
            `H${line1[1][0]}`,
            // 画完整的圆形：先画一个半圆，再画另一个半圆
            `A${circleArcCommand.rx} ${circleArcCommand.ry} ${circleArcCommand.xAxisRotation} ${circleArcCommand.largeArcFlag} ${
                circleArcCommand.sweepFlag
            } ${line1[1][0] + circleArcCommand.rx * 2} ${circleArcCommand.endY}`,
            `A${circleArcCommand.rx} ${circleArcCommand.ry} ${circleArcCommand.xAxisRotation} ${circleArcCommand.largeArcFlag} ${circleArcCommand.sweepFlag} ${circleArcCommand.endX} ${circleArcCommand.endY}`,
            // 垂直椭圆
            `M${verticalArcCommand.endX} ${rectangle.y}`,
            `A${verticalArcCommand.rx} ${verticalArcCommand.ry} ${verticalArcCommand.xAxisRotation} ${verticalArcCommand.largeArcFlag} ${verticalArcCommand.sweepFlag} ${verticalArcCommand.endX} ${verticalArcCommand.endY}`,
            // 最后一条线
            `M${line2[0][0]} ${line2[0][1]} H${line2[1][0]}`
        ].join(' ');

        const shape = rs.path(pathData, {
            ...options,
            fillStyle: 'solid'
        });
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
        const { line1, line2, circleArcCommand, verticalArcCommand } = generateAssemblyPath(rectangle);

        // 检查直线段
        const nearestPointForLines = getNearestPointBetweenPointAndSegments(point, [...line1, ...line2]);
        const distanceForLines = distanceBetweenPointAndPoint(...point, ...nearestPointForLines);

        // 检查中间圆形
        const circleCenter = [line1[1][0] + circleArcCommand.rx, line1[1][1]] as Point;
        const nearestPointForCircle = getNearestPointBetweenPointAndEllipse(point, circleCenter, circleArcCommand.rx, circleArcCommand.ry);
        const distanceForCircle = distanceBetweenPointAndPoint(...point, ...nearestPointForCircle);

        // 检查垂直椭圆（使用 getNearestPointBetweenPointAndArc 处理半圆弧）
        const arcStartPoint: Point = [verticalArcCommand.endX, rectangle.y];
        const nearestPointForEllipse = getNearestPointBetweenPointAndArc(point, arcStartPoint, verticalArcCommand);
        const distanceForEllipse = distanceBetweenPointAndPoint(...point, ...nearestPointForEllipse);

        // 返回最近的点
        const minDistance = Math.min(distanceForLines, distanceForCircle, distanceForEllipse);
        if (minDistance === distanceForLines) return nearestPointForLines;
        if (minDistance === distanceForCircle) return nearestPointForCircle;
        return nearestPointForEllipse;
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
