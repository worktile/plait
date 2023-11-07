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
import { getEdgeOnPolygonByPoint } from '../../utils/geometry';
import { RectangleEngine } from '../basic-shapes/rectangle';
import { getNearestPointBetweenPointAndEllipse } from '../basic-shapes/ellipse';

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
    getEdgeByConnectionPoint(rectangle: RectangleClient, pointOfRectangle: PointOfRectangle): [Point, Point] | null {
        const corners = RectangleEngine.getCornerPoints(rectangle);
        const point = RectangleClient.getConnectionPoint(rectangle, pointOfRectangle);
        return getEdgeOnPolygonByPoint(corners, point);
    },
    getConnectorPoints(rectangle: RectangleClient) {
        return RectangleClient.getEdgeCenterPoints(rectangle);
    }
};

export const getStartEndRadius = (rectangle: RectangleClient) => {
    return Math.min(rectangle.width / 2, rectangle.height / 2);
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
