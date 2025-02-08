import {
    PlaitBoard,
    Point,
    PointOfRectangle,
    RectangleClient,
    SVGArcCommand,
    distanceBetweenPointAndPoint,
    getEllipseTangentSlope,
    getNearestPointBetweenPointAndEllipse,
    getNearestPointBetweenPointAndSegments,
    getVectorFromPointAndSlope,
    setStrokeLinecap
} from '@plait/core';
import { ShapeEngine } from '../../interfaces';
import { Options } from 'roughjs/bin/core';
import { getUnitVectorByPointAndPoint } from '@plait/common';

const percentage = 0.54;

interface ProvidedInterfacePathData {
    startPoint: Point;
    line: {
        startX: number;
        startY: number;
        endX: number;
        endY: number;
    };
    arcCommands: SVGArcCommand[];
}

function generateProvidedInterfacePath(rectangle: RectangleClient): ProvidedInterfacePathData {
    const centerY = rectangle.y + rectangle.height / 2;
    const rx = (rectangle.width * (1 - percentage)) / 2;
    const ry = rectangle.height / 2;

    const startPoint: Point = [rectangle.x, centerY];
    const lineEndX = rectangle.x + rectangle.width * percentage;

    return {
        startPoint,
        line: {
            startX: startPoint[0],
            startY: centerY,
            endX: lineEndX,
            endY: centerY
        },
        arcCommands: [
            {
                rx,
                ry,
                xAxisRotation: 0,
                largeArcFlag: 1,
                sweepFlag: 1,
                endX: rectangle.x + rectangle.width,
                endY: centerY
            },
            {
                rx,
                ry,
                xAxisRotation: 0,
                largeArcFlag: 1,
                sweepFlag: 1,
                endX: lineEndX,
                endY: centerY
            }
        ]
    };
}

export const ProvidedInterfaceEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        const rs = PlaitBoard.getRoughSVG(board);
        const { startPoint, line, arcCommands } = generateProvidedInterfacePath(rectangle);

        const pathData = [
            `M${startPoint[0]} ${startPoint[1]}`,
            `H${line.endX}`,
            ...arcCommands.map(
                (command) =>
                    `A${command.rx} ${command.ry} ${command.xAxisRotation} ${command.largeArcFlag} ${command.sweepFlag} ${command.endX} ${command.endY}`
            )
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
        const { startPoint, line, arcCommands } = generateProvidedInterfacePath(rectangle);

        // 检查直线段
        const lineStart: Point = [line.startX, line.startY];
        const lineEnd: Point = [line.endX, line.endY];
        const nearestPointForLine = getNearestPointBetweenPointAndSegments(point, [lineStart, lineEnd]);
        const distanceForLine = distanceBetweenPointAndPoint(...point, ...nearestPointForLine);

        // 检查圆弧段
        const arcCenter = [rectangle.x + (3 * rectangle.width) / 4, line.startY] as Point;
        const nearestPointForEllipse = getNearestPointBetweenPointAndEllipse(point, arcCenter, arcCommands[0].rx, arcCommands[0].ry);
        const distanceForEllipse = distanceBetweenPointAndPoint(...point, ...nearestPointForEllipse);

        return distanceForLine < distanceForEllipse ? nearestPointForLine : nearestPointForEllipse;
    },
    getTangentVectorByConnectionPoint(rectangle: RectangleClient, pointOfRectangle: PointOfRectangle) {
        const connectionPoint = RectangleClient.getConnectionPoint(rectangle, pointOfRectangle);
        const centerPoint: Point = [rectangle.x + (rectangle.width * 3) / 4, rectangle.y + rectangle.height / 2];
        if (connectionPoint[0] > rectangle.x + rectangle.width * 0.54) {
            const point = [connectionPoint[0] - centerPoint[0], -(connectionPoint[1] - centerPoint[1])];
            const rx = (rectangle.width * 0.46) / 2;
            const ry = rectangle.height / 2;
            const slope = getEllipseTangentSlope(point[0], point[1], rx, ry) as any;
            return getVectorFromPointAndSlope(point[0], point[1], slope);
        }
        return getUnitVectorByPointAndPoint(connectionPoint, [rectangle.x, rectangle.y + rectangle.height / 2]);
    }
};
