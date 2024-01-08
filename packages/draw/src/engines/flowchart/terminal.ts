import {
    PlaitBoard,
    Point,
    PointOfRectangle,
    RectangleClient,
    drawRoundRectangle,
    getNearestPointBetweenPointAndSegments,
    isPointInRoundRectangle
} from '@plait/core';
import { ShapeEngine } from '../../interfaces';
import { Options } from 'roughjs/bin/core';
import { getNearestPointBetweenPointAndEllipse, getTangentSlope, getVectorBySlope } from '../basic-shapes/ellipse';

export const TerminalEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        return drawRoundRectangle(
            PlaitBoard.getRoughSVG(board),
            rectangle.x,
            rectangle.y,
            rectangle.x + rectangle.width,
            rectangle.y + rectangle.height,
            { ...options, fillStyle: 'solid' },
            false,
            getStartEndRadius(rectangle)
        );
    },
    isHit(rectangle: RectangleClient, point: Point) {
        return isPointInRoundRectangle(point, rectangle, getStartEndRadius(rectangle));
    },
    getCornerPoints(rectangle: RectangleClient) {
        return RectangleClient.getCornerPoints(rectangle);
    },
    getNearestPoint(rectangle: RectangleClient, point: Point) {
        return getNearestPointBetweenPointAndRoundRectangle(point, rectangle, getStartEndRadius(rectangle));
    },
    getTangentVectorByConnectionPoint(rectangle: RectangleClient, pointOfRectangle: PointOfRectangle) {
        const connectionPoint = RectangleClient.getConnectionPoint(rectangle, pointOfRectangle);
        const radius = getStartEndRadius(rectangle);
        const center = getBoundCenterOfRoundRectangle(rectangle, radius, connectionPoint);
        if (center) {
            const point = [connectionPoint[0] - center[0], -(connectionPoint[1] - center[1])];
            const a = radius;
            const b = radius;
            const slope = getTangentSlope(point[0], point[1], a, b) as any;
            return getVectorBySlope(point[0], point[1], slope);
        }
        return null;
    },
    getConnectorPoints(rectangle: RectangleClient) {
        return RectangleClient.getEdgeCenterPoints(rectangle);
    }
};

export const getStartEndRadius = (rectangle: RectangleClient) => {
    return Math.min(rectangle.width / 2, rectangle.height / 2);
};

export function getNearestPointBetweenPointAndRoundRectangle(point: Point, rectangle: RectangleClient, radius: number) {
    let result: Point | null = null;
    let boundCenter: Point | null = getBoundCenterOfRoundRectangle(rectangle, radius, point);
    if (boundCenter) {
        result = getNearestPointBetweenPointAndEllipse(point, boundCenter, radius, radius);
    } else {
        const cornerPoints = RectangleClient.getCornerPoints(rectangle);
        result = getNearestPointBetweenPointAndSegments(point, cornerPoints);
    }
    return result;
}

export function getBoundCenterOfRoundRectangle(rectangle: RectangleClient, radius: number, point: Point) {
    const { x, y, width, height } = rectangle;
    let center: Point | null = null;
    const inLeftTop = point[0] >= x && point[0] <= x + radius && point[1] >= y && point[1] <= y + radius;
    if (inLeftTop) {
        center = [x + radius, y + radius];
    }
    const inLeftBottom = point[0] >= x && point[0] <= x + radius && point[1] >= y + height - radius && point[1] <= y + height;
    if (inLeftBottom) {
        center = [x + radius, y + height - radius];
    }
    const inRightTop = point[0] >= x + width - radius && point[0] <= x + width && point[1] >= y && point[1] <= y + radius;
    if (inRightTop) {
        center = [x + width - radius, y + radius];
    }
    const inRightBottom =
        point[0] >= x + width - radius && point[0] <= x + width && point[1] >= y + height - radius && point[1] <= y + height;
    if (inRightBottom) {
        center = [x + width - radius, y + height - radius];
    }
    return center;
}
