import {
    PlaitBoard,
    Point,
    PointOfRectangle,
    RectangleClient,
    drawRoundRectangle,
    getNearestPointBetweenPointAndSegments
} from '@plait/core';
import { ShapeEngine } from '../../interfaces';
import { Options } from 'roughjs/bin/core';
import { getPolygonEdgeByConnectionPoint } from '../../utils/polygon';
import { RectangleEngine } from '../basic-shapes/rectangle';

export const TemplateEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        const rs = PlaitBoard.getRoughSVG(board);

        return drawRoundRectangle(
            rs,
            rectangle.x,
            rectangle.y,
            rectangle.x + rectangle.width,
            rectangle.y + rectangle.height,
            {
                ...options,
                fillStyle: 'solid',
                dashGap: 10,
                strokeLineDash: [10, 10]
            },
            false,
            4
        );
    },
    isInsidePoint(rectangle: RectangleClient, point: Point) {
        const rangeRectangle = RectangleClient.getRectangleByPoints([point, point]);
        return RectangleClient.isHit(rectangle, rangeRectangle);
    },
    getCornerPoints(rectangle: RectangleClient) {
        return RectangleClient.getCornerPoints(rectangle);
    },
    getNearestPoint(rectangle: RectangleClient, point: Point) {
        return getNearestPointBetweenPointAndSegments(point, RectangleEngine.getCornerPoints(rectangle));
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
