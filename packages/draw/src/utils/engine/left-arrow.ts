import {
    PlaitBoard,
    Point,
    RectangleClient,
    getNearestPointBetweenPointAndSegments,
    isPointInPolygon,
    setStrokeLinecap
} from '@plait/core';
import { ShapeEngine } from '../../interfaces';
import { Options } from 'roughjs/bin/core';

export const LeftArrowEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        const points = getLeftArrowPoints(rectangle);
        const rs = PlaitBoard.getRoughSVG(board);
        const polygon = rs.polygon(points, { ...options, fillStyle: 'solid' });
        setStrokeLinecap(polygon, 'round');
        return polygon;
    },
    getCornerPoints(rectangle: RectangleClient) {
        return getLeftArrowPoints(rectangle);
    },
    isHit(rectangle: RectangleClient, point: Point) {
        const points = getLeftArrowPoints(rectangle);
        return isPointInPolygon(point, points);
    },
    getNearestPoint(rectangle: RectangleClient, point: Point) {
        const cornerPoints = getLeftArrowPoints(rectangle);
        return getNearestPointBetweenPointAndSegments(point, cornerPoints);
    },
    getConnectorPoints(rectangle: RectangleClient) {
        return [
            [rectangle.x, rectangle.y + rectangle.height / 2],
            [rectangle.x + rectangle.width, rectangle.y + rectangle.height / 2]
        ];
    }
};

export const getLeftArrowPoints = (rectangle: RectangleClient): Point[] => {
    return [
        [rectangle.x, rectangle.y + rectangle.height / 2],
        [rectangle.x + rectangle.width * 0.32, rectangle.y],
        [rectangle.x + rectangle.width * 0.32, rectangle.y + rectangle.height * 0.2],
        [rectangle.x + rectangle.width, rectangle.y + rectangle.height * 0.2],
        [rectangle.x + rectangle.width, rectangle.y + rectangle.height * 0.8],
        [rectangle.x + rectangle.width * 0.32, rectangle.y + rectangle.height * 0.8],
        [rectangle.x + rectangle.width * 0.32, rectangle.y + rectangle.height]
    ];
};
