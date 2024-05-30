import {
    PlaitBoard,
    Point,
    PointOfRectangle,
    RectangleClient,
    getNearestPointBetweenPointAndSegments,
    setPathStrokeLinecap
} from '@plait/core';
import { PlaitGeometry, ShapeEngine } from '../../interfaces';
import { Options } from 'roughjs/bin/core';
import { getPolygonEdgeByConnectionPoint } from '../../utils/polygon';
import { getStrokeWidthByElement } from '../../utils';
import { ShapeDefaultSpace } from '../../constants';

export const CloudEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        const rs = PlaitBoard.getRoughSVG(board);
        const divisionWidth = rectangle.width / 7;
        const divisionHeight = rectangle.height / 3.2;
        const xRadius = divisionWidth / 8.5;
        const yRadius = divisionHeight / 20;
        const svgElement = rs.path(
            `M ${rectangle.x + divisionWidth} ${rectangle.y + divisionHeight}
             A ${xRadius} ${yRadius * 1.2} 0 1 1 ${rectangle.x + divisionWidth * 2} ${rectangle.y + divisionHeight / 2}
             A ${xRadius} ${yRadius} 0 1 1 ${rectangle.x + divisionWidth * 4.2} ${rectangle.y + divisionHeight / 2.2}
             A ${xRadius} ${yRadius} 0 1 1 ${rectangle.x + divisionWidth * 5.8} ${rectangle.y + divisionHeight}
             A ${xRadius} ${yRadius * 1.3} 0 1 1 ${rectangle.x + divisionWidth * 6} ${rectangle.y + divisionHeight * 2.2}
             A ${xRadius} ${yRadius * 1.2} 0 1 1 ${rectangle.x + divisionWidth * 5} ${rectangle.y + divisionHeight * 2.8}
             A ${xRadius} ${yRadius / 1.2} 0 1 1 ${rectangle.x + divisionWidth * 2.8} ${rectangle.y + divisionHeight * 2.8}
             A ${xRadius} ${yRadius} 0 1 1 ${rectangle.x + divisionWidth} ${rectangle.y + divisionHeight * 2.2}
             A ${xRadius} ${yRadius * 1.42} 0 1 1 ${rectangle.x + divisionWidth} ${rectangle.y + divisionHeight}
            Z`,
            { ...options, fillStyle: 'solid' }
        );
        setPathStrokeLinecap(svgElement, 'round');
        return svgElement;
    },
    isInsidePoint(rectangle: RectangleClient, point: Point) {
        const rangeRectangle = RectangleClient.getRectangleByPoints([point, point]);
        return RectangleClient.isHit(rectangle, rangeRectangle);
    },
    getCornerPoints(rectangle: RectangleClient) {
        return RectangleClient.getCornerPoints(rectangle);
    },
    getNearestPoint(rectangle: RectangleClient, point: Point) {
        return getNearestPointBetweenPointAndSegments(point, CloudEngine.getCornerPoints(rectangle));
    },
    getEdgeByConnectionPoint(rectangle: RectangleClient, pointOfRectangle: PointOfRectangle): [Point, Point] | null {
        const corners = CloudEngine.getCornerPoints(rectangle);
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
        const originWidth = elementRectangle.width - ShapeDefaultSpace.rectangleAndText * 2 - strokeWidth * 2;
        const width = originWidth / 1.5;
        return {
            height,
            width: width > 0 ? width : 0,
            x: elementRectangle.x + ShapeDefaultSpace.rectangleAndText + strokeWidth + originWidth / 6,
            y: elementRectangle.y + elementRectangle.height / 6 + ((elementRectangle.height * 4) / 6 - height) / 2
        };
    }
};
