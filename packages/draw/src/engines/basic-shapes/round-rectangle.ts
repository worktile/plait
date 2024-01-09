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
import { getNearestPointBetweenPointAndEllipse } from './ellipse';
import { RectangleEngine } from './rectangle';
import { getPolygonEdgeByConnectionPoint } from '../../utils/geometry';

export const RoundRectangleEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        return drawRoundRectangle(
            PlaitBoard.getRoughSVG(board),
            rectangle.x,
            rectangle.y,
            rectangle.x + rectangle.width,
            rectangle.y + rectangle.height,
            { ...options, fillStyle: 'solid' },
            false,
            getRoundRectangleRadius(rectangle)
        );
    },
    isHit(rectangle: RectangleClient, point: Point) {
        return isPointInRoundRectangle(point, rectangle, getRoundRectangleRadius(rectangle));
    },
    getCornerPoints(rectangle: RectangleClient) {
        return RectangleClient.getCornerPoints(rectangle);
    },
    getNearestPoint(rectangle: RectangleClient, point: Point) {
        return getNearestPointBetweenPointAndRoundRectangle(point, rectangle, getRoundRectangleRadius(rectangle));
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

export const getRoundRectangleRadius = (rectangle: RectangleClient) => {
    return Math.min(rectangle.width * 0.1, rectangle.height * 0.1);
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
