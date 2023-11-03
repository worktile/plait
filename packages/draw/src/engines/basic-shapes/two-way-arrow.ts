import {
    PlaitBoard,
    Point,
    PointOfRectangle,
    RectangleClient,
    getNearestPointBetweenPointAndSegments,
    isPointInPolygon,
    setStrokeLinecap
} from '@plait/core';
import { ShapeEngine } from '../../interfaces';
import { Options } from 'roughjs/bin/core';
import { getEdgeOnPolygonByPoint } from '../../utils/geometry';

export const TwoWayArrowEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        const points = getTwoWayArrowPoints(rectangle);
        const rs = PlaitBoard.getRoughSVG(board);
        const polygon = rs.polygon(points, { ...options, fillStyle: 'solid' });
        setStrokeLinecap(polygon, 'round');
        return polygon;
    },
    getCornerPoints(rectangle: RectangleClient) {
        return getTwoWayArrowPoints(rectangle);
    },
    isHit(rectangle: RectangleClient, point: Point) {
        const points = getTwoWayArrowPoints(rectangle);
        return isPointInPolygon(point, points);
    },
    getNearestPoint(rectangle: RectangleClient, point: Point) {
        const cornerPoints = getTwoWayArrowPoints(rectangle);
        return getNearestPointBetweenPointAndSegments(point, cornerPoints);
    },
    getEdgeByConnectionPoint(rectangle: RectangleClient, pointOfRectangle: PointOfRectangle): [Point, Point] | null {
        const corners = getTwoWayArrowPoints(rectangle);
        const point = RectangleClient.getConnectionPoint(rectangle, pointOfRectangle);
        return getEdgeOnPolygonByPoint(corners, point);
    },
    getConnectorPoints(rectangle: RectangleClient) {
        return [
            [rectangle.x, rectangle.y + rectangle.height / 2],
            [rectangle.x + rectangle.width, rectangle.y + rectangle.height / 2]
        ];
    }
};

export const getTwoWayArrowPoints = (rectangle: RectangleClient): Point[] => {
    return [
        [rectangle.x, rectangle.y + rectangle.height / 2],
        [rectangle.x + (rectangle.width * 8) / 25, rectangle.y],
        [rectangle.x + (rectangle.width * 8) / 25, rectangle.y + rectangle.height / 5],
        [rectangle.x + (rectangle.width * 17) / 25, rectangle.y + rectangle.height / 5],
        [rectangle.x + (rectangle.width * 17) / 25, rectangle.y],
        [rectangle.x + rectangle.width, rectangle.y + rectangle.height / 2],
        [rectangle.x + (rectangle.width * 17) / 25, rectangle.y + rectangle.height],
        [rectangle.x + (rectangle.width * 17) / 25, rectangle.y + (rectangle.height * 4) / 5],
        [rectangle.x + (rectangle.width * 8) / 25, rectangle.y + (rectangle.height * 4) / 5],
        [rectangle.x + (rectangle.width * 8) / 25, rectangle.y + rectangle.height]
    ];
};
