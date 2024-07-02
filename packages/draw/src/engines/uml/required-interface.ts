import {
    PlaitBoard,
    Point,
    PointOfRectangle,
    RectangleClient,
    getNearestPointBetweenPointAndSegments,
    setStrokeLinecap
} from '@plait/core';
import { ShapeEngine } from '../../interfaces';
import { Options } from 'roughjs/bin/core';
import { RectangleEngine } from '../basic-shapes/rectangle';
import { getPolygonEdgeByConnectionPoint } from '../../utils/polygon';

export const RequiredInterfaceEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        const rs = PlaitBoard.getRoughSVG(board);
        const shape = rs.path(
            `M${rectangle.x} ${rectangle.y} 
        A${rectangle.width * 0.39} ${rectangle.height / 2}, 0, 0, 1 ${rectangle.x} ${rectangle.y + rectangle.height}
        M${rectangle.x + rectangle.width * 0.41} ${rectangle.y + rectangle.height / 2} H${rectangle.x + rectangle.width}
        `,
            {
                ...options,
                fillStyle: 'solid',
                fill: 'transparent'
            }
        );
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
