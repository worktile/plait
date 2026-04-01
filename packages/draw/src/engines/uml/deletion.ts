import {
    PlaitBoard,
    Point,
    PointOfRectangle,
    RectangleClient,
    distanceBetweenPointAndPoint,
    getNearestPointBetweenPointAndSegment,
    getNearestPointBetweenPointAndSegments,
    setStrokeLinecap
} from '@plait/core';
import { ShapeEngine } from '../../interfaces';
import { Options } from 'roughjs/bin/core';
import { getPolygonEdgeByConnectionPoint } from '../../utils/polygon';
import { RectangleEngine } from '../basic-shapes/rectangle';

function getDeletionLines(rectangle: RectangleClient): Array<[Point, Point]> {
    return [
        [
            [rectangle.x, rectangle.y],
            [rectangle.x + rectangle.width, rectangle.y + rectangle.height]
        ],
        [
            [rectangle.x + rectangle.width, rectangle.y],
            [rectangle.x, rectangle.y + rectangle.height]
        ]
    ];
}

export const DeletionEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        const rs = PlaitBoard.getRoughSVG(board);
        const lines = getDeletionLines(rectangle);
        const shape = rs.path(lines.map(([from, to]) => `M${from[0]} ${from[1]} L${to[0]} ${to[1]}`).join(' '), {
            ...options,
            fillStyle: 'solid',
            strokeWidth: 4
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
        const lines = getDeletionLines(rectangle);
        let minDistance = Infinity;
        let nearestPoint = point;
        lines.forEach((line) => {
            const currentPoint = getNearestPointBetweenPointAndSegment(point, line);
            const distance = distanceBetweenPointAndPoint(point[0], point[1], currentPoint[0], currentPoint[1]);
            if (distance < minDistance) {
                minDistance = distance;
                nearestPoint = currentPoint;
            }
        });
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
