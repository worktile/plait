import {
    PlaitBoard,
    Point,
    PointOfRectangle,
    RectangleClient,
    getNearestPointBetweenPointAndSegments,
    isPointInPolygon,
    isPointInRoundRectangle
} from '@plait/core';
import { PlaitGeometry, ShapeEngine } from '../../interfaces';
import { Options } from 'roughjs/bin/core';
import { ShapeDefaultSpace } from '../../constants';
import { getRoundRectangleRadius } from './round-rectangle';
import { getPolygonEdgeByConnectionPoint } from '../../utils/polygon';
import { getStrokeWidthByElement } from '../../utils/common';

const heightRatio = 3 / 4;

export const RoundCommentEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        const rs = PlaitBoard.getRoughSVG(board);
        const x1 = rectangle.x;
        const y1 = rectangle.y;
        const x2 = rectangle.x + rectangle.width;
        const y2 = rectangle.y + rectangle.height * heightRatio;
        const radius = getRoundRectangleRadius(rectangle);

        const point1 = [x1 + radius, y1];
        const point2 = [x2 - radius, y1];
        const point3 = [x2, y1 + radius];
        const point4 = [x2, y2 - radius];
        const point5 = [x2 - radius, y2];
        const point6 = [x1 + radius, y2];
        const point7 = [x1, y2 - radius];
        const point8 = [x1, y1 + radius];

        const point9 = [x1 + rectangle.width / 4, y2];
        const point10 = [x1 + rectangle.width / 4, rectangle.y + rectangle.height];
        const point11 = [x1 + rectangle.width / 2, y2];

        return rs.path(
            `M${point2[0]} ${point2[1]} A ${radius} ${radius}, 0, 0, 1, ${point3[0]} ${point3[1]} L ${point4[0]} ${point4[1]} A ${radius} ${radius}, 0, 0, 1, ${point5[0]} ${point5[1]} L    ${point11[0]} ${point11[1]}  ${point10[0]} ${point10[1]}   ${point9[0]} ${point9[1]}   ${point6[0]} ${point6[1]} A ${radius} ${radius}, 0, 0, 1, ${point7[0]} ${point7[1]} L ${point8[0]} ${point8[1]} A ${radius} ${radius}, 0, 0, 1, ${point1[0]} ${point1[1]} Z`,
            { ...options, fillStyle: 'solid' }
        );
    },
    isInsidePoint(rectangle: RectangleClient, point: Point) {
        const points: Point[] = [
            [rectangle.x + rectangle.width / 4, rectangle.y + (rectangle.height * 3) / 4],
            [rectangle.x + rectangle.width / 4, rectangle.y + rectangle.height],
            [rectangle.x + rectangle.width / 2, rectangle.y + (rectangle.height * 3) / 4]
        ];
        rectangle.height = (rectangle.height * 3) / 4;
        return isPointInPolygon(point, points) || isPointInRoundRectangle(point, rectangle, getRoundRectangleRadius(rectangle));
    },
    getCornerPoints(rectangle: RectangleClient) {
        return getRoundCommentPoints(rectangle);
    },
    getNearestPoint(rectangle: RectangleClient, point: Point) {
        return getNearestPointBetweenPointAndSegments(point, getRoundCommentPoints(rectangle));
    },
    getEdgeByConnectionPoint(rectangle: RectangleClient, pointOfRectangle: PointOfRectangle): [Point, Point] | null {
        const corners = getRoundCommentPoints(rectangle);
        const point = RectangleClient.getConnectionPoint(rectangle, pointOfRectangle);
        return getPolygonEdgeByConnectionPoint(corners, point);
    },
    getConnectorPoints(rectangle: RectangleClient) {
        return [
            [rectangle.x + rectangle.width / 2, rectangle.y],
            [rectangle.x + rectangle.width, rectangle.y + rectangle.height / 2],
            [rectangle.x + rectangle.width / 2, rectangle.y + rectangle.height * heightRatio],
            [rectangle.x, rectangle.y + rectangle.height / 2]
        ];
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

export const getRoundCommentPoints = (rectangle: RectangleClient): Point[] => {
    return [
        [rectangle.x, rectangle.y],
        [rectangle.x + rectangle.width, rectangle.y],
        [rectangle.x + rectangle.width, rectangle.y + rectangle.height * heightRatio],
        [rectangle.x + rectangle.width / 2, rectangle.y + rectangle.height * heightRatio],
        [rectangle.x + rectangle.width / 4, rectangle.y + rectangle.height],
        [rectangle.x + rectangle.width / 4, rectangle.y + rectangle.height * heightRatio],
        [rectangle.x, rectangle.y + rectangle.height * heightRatio]
    ];
};
