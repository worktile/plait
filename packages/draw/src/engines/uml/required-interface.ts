import {
    PlaitBoard,
    Point,
    PointOfRectangle,
    RectangleClient,
    getNearestPointBetweenPointAndSegments,
    getNearestPointBetweenPointAndArc,
    distanceBetweenPointAndPoint,
    setStrokeLinecap,
    getNearestPointBetweenPointAndSegment,
    SVGArcCommand
} from '@plait/core';
import { ShapeEngine } from '../../interfaces';
import { Options } from 'roughjs/bin/core';
import { RectangleEngine } from '../basic-shapes/rectangle';
import { getPolygonEdgeByConnectionPoint } from '../../utils/polygon';

interface RequiredInterfacePathData {
    startPoint: Point;
    leftArcCommand: SVGArcCommand;
    line: {
        startX: number;
        startY: number;
        endX: number;
        endY: number;
    };
}

function generateRequiredInterfacePath(rectangle: RectangleClient): RequiredInterfacePathData {
    const arcWidth = rectangle.width * 0.39;
    const arcHeight = rectangle.height / 2;

    return {
        startPoint: [rectangle.x, rectangle.y],
        leftArcCommand: {
            rx: arcWidth,
            ry: arcHeight,
            xAxisRotation: 0,
            largeArcFlag: 0,
            sweepFlag: 1,
            endX: rectangle.x,
            endY: rectangle.y + rectangle.height
        },
        line: {
            startX: rectangle.x + rectangle.width * 0.41,
            startY: rectangle.y + rectangle.height / 2,
            endX: rectangle.x + rectangle.width,
            endY: rectangle.y + rectangle.height / 2
        }
    };
}

export const RequiredInterfaceEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        const rs = PlaitBoard.getRoughSVG(board);
        const { startPoint, leftArcCommand, line } = generateRequiredInterfacePath(rectangle);

        const pathData = [
            `M${startPoint[0]} ${startPoint[1]}`,
            `A${leftArcCommand.rx} ${leftArcCommand.ry} ${leftArcCommand.xAxisRotation} ${leftArcCommand.largeArcFlag} ${leftArcCommand.sweepFlag} ${leftArcCommand.endX} ${leftArcCommand.endY}`,
            `M${line.startX} ${line.startY} H${line.endX}`
        ].join(' ');

        const shape = rs.path(pathData, {
            ...options,
            fillStyle: 'solid',
            fill: 'transparent'
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
    getNearestPoint(rectangle: RectangleClient, point: Point) {
        const { startPoint, leftArcCommand, line } = generateRequiredInterfacePath(rectangle);
        let minDistance = Infinity;
        let nearestPoint = point;

        // 检查圆弧段
        const arcNearestPoint = getNearestPointBetweenPointAndArc(point, startPoint, leftArcCommand);
        const arcDistance = distanceBetweenPointAndPoint(point[0], point[1], arcNearestPoint[0], arcNearestPoint[1]);
        if (arcDistance < minDistance) {
            minDistance = arcDistance;
            nearestPoint = arcNearestPoint;
        }

        // 检查直线段
        const lineStart: Point = [line.startX, line.startY];
        const lineEnd: Point = [line.endX, line.endY];
        const lineNearestPoint = getNearestPointBetweenPointAndSegment(point, [lineStart, lineEnd]);
        const lineDistance = distanceBetweenPointAndPoint(point[0], point[1], lineNearestPoint[0], lineNearestPoint[1]);
        if (lineDistance < minDistance) {
            minDistance = lineDistance;
            nearestPoint = lineNearestPoint;
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
    }
};
