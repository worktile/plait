import {
    PlaitBoard,
    Point,
    PointOfRectangle,
    RectangleClient,
    getEllipseTangentSlope,
    getNearestPointBetweenPointAndSegments,
    getVectorFromPointAndSlope,
    setStrokeLinecap,
    getNearestPointBetweenPointAndEllipse
} from '@plait/core';
import { PlaitGeometry, ShapeEngine } from '../../interfaces';
import { Options } from 'roughjs/bin/core';
import { RectangleEngine } from '../basic-shapes/rectangle';
import { getStrokeWidthByElement } from '../../utils';
import { ShapeDefaultSpace } from '../../constants';

export const NoteEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        const rs = PlaitBoard.getRoughSVG(board);
        const shape = rs.path(
            `M${rectangle.x} ${rectangle.y} 
            h${rectangle.width - 16}
            v16
            h16
            v${rectangle.height - 16}
            h${-rectangle.width}
            Z
            M${rectangle.x + rectangle.width - 16} ${rectangle.y} 
            A16 16, 0,0,1, ${rectangle.x + rectangle.width} ${rectangle.y + 16}
            `,
            { ...options, fillStyle: 'solid' }
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
        const nearestPoint = getNearestPointBetweenPointAndSegments(point, RectangleEngine.getCornerPoints(rectangle));
        if (nearestPoint[0] > rectangle.x + rectangle.width - 16 && nearestPoint[1] < rectangle.y + 16) {
            return getNearestPointBetweenPointAndEllipse(point, [rectangle.x + rectangle.width - 16, rectangle.y + 16], 16, 16);
        }
        return nearestPoint;
    },
    getTangentVectorByConnectionPoint(rectangle: RectangleClient, pointOfRectangle: PointOfRectangle) {
        const connectionPoint = RectangleClient.getConnectionPoint(rectangle, pointOfRectangle);
        const centerPoint: Point = [rectangle.x + (rectangle.width * 3) / 4, rectangle.y + rectangle.height / 2];
        const point = [connectionPoint[0] - centerPoint[0], -(connectionPoint[1] - centerPoint[1])];
        const slope = getEllipseTangentSlope(point[0], point[1], 16, 16) as any;
        return getVectorFromPointAndSlope(point[0], point[1], slope);
    },
    getConnectorPoints(rectangle: RectangleClient) {
        return RectangleClient.getEdgeCenterPoints(rectangle);
    },
    getTextRectangle: (element: PlaitGeometry) => {
        const elementRectangle = RectangleClient.getRectangleByPoints(element.points!);
        const strokeWidth = getStrokeWidthByElement(element);
        const height = element.textHeight!;
        const width = elementRectangle.width - ShapeDefaultSpace.rectangleAndText * 2 - strokeWidth - 15;
        return {
            height,
            width: width > 0 ? width : 0,
            x: elementRectangle.x + ShapeDefaultSpace.rectangleAndText + strokeWidth,
            y: elementRectangle.y + (elementRectangle.height - height) / 2
        };
    }
};
