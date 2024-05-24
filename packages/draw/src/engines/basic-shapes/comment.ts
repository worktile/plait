import {
    PlaitBoard,
    Point,
    PointOfRectangle,
    RectangleClient,
    getNearestPointBetweenPointAndSegments,
    isPointInPolygon,
    setStrokeLinecap
} from '@plait/core';
import { PlaitGeometry, ShapeEngine } from '../../interfaces';
import { Options } from 'roughjs/bin/core';
import { ShapeDefaultSpace } from '../../constants';
import { getStrokeWidthByElement } from '../../utils';
import { getPolygonEdgeByConnectionPoint } from '../../utils/polygon';

const heightRatio = 3 / 4;

export const CommentEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        const points = getCommentPoints(rectangle);
        const rs = PlaitBoard.getRoughSVG(board);
        const polygon = rs.polygon(points, { ...options, fillStyle: 'solid' });
        setStrokeLinecap(polygon, 'round');
        return polygon;
    },
    isInsidePoint(rectangle: RectangleClient, point: Point) {
        const parallelogramPoints = getCommentPoints(rectangle);
        return isPointInPolygon(point, parallelogramPoints);
    },
    getCornerPoints(rectangle: RectangleClient) {
        return getCommentPoints(rectangle);
    },
    getNearestPoint(rectangle: RectangleClient, point: Point) {
        return getNearestPointBetweenPointAndSegments(point, getCommentPoints(rectangle));
    },
    getEdgeByConnectionPoint(rectangle: RectangleClient, pointOfRectangle: PointOfRectangle): [Point, Point] | null {
        const corners = getCommentPoints(rectangle);
        const point = RectangleClient.getConnectionPoint(rectangle, pointOfRectangle);
        return getPolygonEdgeByConnectionPoint(corners, point);
    },
    getConnectorPoints(rectangle: RectangleClient) {
        return RectangleClient.getEdgeCenterPoints(rectangle);
    },
    getTextRectangle(element: PlaitGeometry) {
        const elementRectangle = RectangleClient.getRectangleByPoints(element.points!);
        const strokeWidth = getStrokeWidthByElement(element);
        const height = element.textHeight!;
        const width = elementRectangle.width - ShapeDefaultSpace.rectangleAndText * 2 - strokeWidth * 2;
        return {
            height,
            width: width > 0 ? width : 0,
            x: elementRectangle.x + ShapeDefaultSpace.rectangleAndText + strokeWidth,
            y: elementRectangle.y + (elementRectangle.height * heightRatio - height) / 2
        };
    }
};

export const getCommentPoints = (rectangle: RectangleClient): Point[] => {
    return [
        [rectangle.x, rectangle.y],
        [rectangle.x + rectangle.width, rectangle.y],
        [rectangle.x + rectangle.width, rectangle.y + rectangle.height * heightRatio],
        [rectangle.x + (rectangle.width * 3) / 5, rectangle.y + rectangle.height * heightRatio],
        [rectangle.x + rectangle.width / 2, rectangle.y + rectangle.height],
        [rectangle.x + (rectangle.width * 2) / 5, rectangle.y + rectangle.height * heightRatio],
        [rectangle.x, rectangle.y + rectangle.height * heightRatio]
    ];
};
