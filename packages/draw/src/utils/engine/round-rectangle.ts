import {
    PlaitBoard,
    Point,
    RectangleClient,
    drawRoundRectangle,
    getNearestPointBetweenPointAndSegments,
    isPointInRoundRectangle
} from '@plait/core';
import { ShapeEngine } from '../../interfaces';
import { Options } from 'roughjs/bin/core';
import { getNearestPointBetweenPointAndEllipse } from './ellipse';

export const RoundRectangleEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        return drawRoundRectangle(
            PlaitBoard.getRoughSVG(board),
            rectangle.x,
            rectangle.y,
            rectangle.x + rectangle.width,
            rectangle.y + rectangle.height,
            options,
            false,
            getRoundRectangleRadius(rectangle)
        );
    },
    isHit(rectangle: RectangleClient, point: Point) {
        return isPointInRoundRectangle(point, rectangle, getRoundRectangleRadius(rectangle));
    },
    getNearestPoint(rectangle: RectangleClient, point: Point) {
        return getNearestPointBetweenPointAndRoundRectangle(point, rectangle, getRoundRectangleRadius(rectangle));
    },
    getConnectorPoints(rectangle: RectangleClient) {
        return RectangleClient.getEdgeCenterPoints(rectangle);
    }
};

export const getRoundRectangleRadius = (rectangle: RectangleClient) => {
    return Math.min(rectangle.width * 0.5, rectangle.height * 0.5);
};

export function getNearestPointBetweenPointAndRoundRectangle(point: Point, rectangle: RectangleClient, radius: number) {
    const { x: rectX, y: rectY, width, height } = rectangle;
    const cornerPoints = RectangleClient.getCornerPoints(rectangle);
    let result = getNearestPointBetweenPointAndSegments(point, cornerPoints);
    let circleCenter: Point | null = null;

    const inLeftTop = point[0] >= rectX && point[0] <= rectX + radius && point[1] >= rectY && point[1] <= rectY + radius;
    if (inLeftTop) {
        circleCenter = [rectX + radius, rectY + radius];
    }
    const inLeftBottom =
        point[0] >= rectX && point[0] <= rectX + radius && point[1] >= rectY + height && point[1] <= rectY + height - radius;
    if (inLeftBottom) {
        circleCenter = [rectX + radius, rectY + height - radius];
    }
    const inRightTop = point[0] >= rectX + width - radius && point[0] <= rectX + width && point[1] >= rectY && point[1] <= rectY + radius;
    if (inRightTop) {
        circleCenter = [rectX + width - radius, rectY + radius];
    }
    const inRightBottom =
        point[0] >= rectX + width - radius &&
        point[0] <= rectX + width &&
        point[1] >= rectY + height - radius &&
        point[1] <= rectY + height;
    if (inRightBottom) {
        circleCenter = [rectX + width - radius, rectY + height - radius];
    }
    if (circleCenter) {
        result = getNearestPointBetweenPointAndEllipse(point, circleCenter, radius, radius);
    }
    return result;
}
