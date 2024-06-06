import {
    PlaitBoard,
    Point,
    PointOfRectangle,
    RectangleClient,
    getNearestPointBetweenPointAndSegments,
    setStrokeLinecap
} from '@plait/core';
import { PlaitGeometry, ShapeEngine } from '../../interfaces';
import { Options } from 'roughjs/bin/core';
import { getPolygonEdgeByConnectionPoint } from '../../utils/polygon';
import { RectangleEngine } from '../basic-shapes/rectangle';
import { getStrokeWidthByElement } from '../../utils';
import { ShapeDefaultSpace } from '../../constants';
import { ComponentEngine } from './component';

export const ComponentBoxEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        const rs = PlaitBoard.getRoughSVG(board);
        const componentWidth = rectangle.width - 45 * 2 - 18 > 1 ? 45 : rectangle.width * 0.25;
        const componentHeight = rectangle.height - 30 - 8 * 2 > 1 ? 30 : rectangle.height * 0.2;

        const componentRectangle = {
            x: rectangle.x + rectangle.width - 18 - componentWidth,
            y: rectangle.y + 8,
            width: componentWidth,
            height: componentHeight
        };
        const shape = rs.path(
            `M${rectangle.x} ${rectangle.y} 
            H${rectangle.x + rectangle.width} 
            V${rectangle.y + rectangle.height} 
            H${rectangle.x} Z

            `,
            { ...options, fillStyle: 'solid' }
        );

        const componentShape = ComponentEngine.draw(board, componentRectangle, options);
        shape.append(componentShape);
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
    },
    getTextRectangle(element: PlaitGeometry) {
        const elementRectangle = RectangleClient.getRectangleByPoints(element.points!);
        const strokeWidth = getStrokeWidthByElement(element);
        const height = element.textHeight!;
        const componentWidth = elementRectangle.width - 45 * 2 - 18 > 1 ? 45 : elementRectangle.width * 0.25;
        const width = elementRectangle.width - 18 - componentWidth - ShapeDefaultSpace.rectangleAndText - strokeWidth * 2;
        return {
            height,
            width: width > 0 ? width : 0,
            x: elementRectangle.x + ShapeDefaultSpace.rectangleAndText + strokeWidth,
            y: elementRectangle.y + (elementRectangle.height - height) / 2
        };
    }
};
