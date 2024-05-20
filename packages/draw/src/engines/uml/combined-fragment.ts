import {
    PlaitBoard,
    Point,
    PointOfRectangle,
    RectangleClient,
    getNearestPointBetweenPointAndSegments,
    setStrokeLinecap
} from '@plait/core';
import { MultipleTextGeometryCommonTextKeys, PlaitMultipleTextGeometry, ShapeEngine } from '../../interfaces';
import { Options } from 'roughjs/bin/core';
import { getPolygonEdgeByConnectionPoint } from '../../utils/polygon';
import { RectangleEngine } from '../basic-shapes/rectangle';
import { getStrokeWidthByElement } from '../../utils';
import { ShapeDefaultSpace } from '../../constants';
import { PlaitDrawShapeText } from '../../generators/text.generator';

export const CombinedFragmentEngine: ShapeEngine<PlaitMultipleTextGeometry, {}, PlaitDrawShapeText> = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        const rs = PlaitBoard.getRoughSVG(board);
        const shape = rs.path(
            `M${rectangle.x} ${rectangle.y + 25} 
            V${rectangle.y}
            H${rectangle.x + rectangle.width} 
            V${rectangle.y + rectangle.height}
            H${rectangle.x}
            V${rectangle.y + 25}
            H${rectangle.x + rectangle.width / 3 - 8}
            L${rectangle.x + rectangle.width / 3} ${rectangle.y + 16}
            V${rectangle.y}
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
    getTextRectangle(element: PlaitMultipleTextGeometry, options?: PlaitDrawShapeText) {
        const elementRectangle = RectangleClient.getRectangleByPoints(element.points!);
        const strokeWidth = getStrokeWidthByElement(element);
        const textHeight = element.texts?.find(item => item.key === options?.key)?.textHeight!;
        if (options?.key === MultipleTextGeometryCommonTextKeys.name) {
            const width = elementRectangle.width / 3 - 8 - ShapeDefaultSpace.rectangleAndText - strokeWidth;
            return {
                height: textHeight,
                width: width > 0 ? width : 0,
                x: elementRectangle.x + ShapeDefaultSpace.rectangleAndText + strokeWidth,
                y: elementRectangle.y + (25 - textHeight) / 2
            };
        }
        if (options?.key === MultipleTextGeometryCommonTextKeys.content) {
            const width = elementRectangle.width - ShapeDefaultSpace.rectangleAndText * 2 - strokeWidth * 2;
            return {
                height: textHeight,
                width: width > 0 ? width : 0,
                x: elementRectangle.x + ShapeDefaultSpace.rectangleAndText + strokeWidth,
                y: elementRectangle.y + 25 + ShapeDefaultSpace.rectangleAndText + strokeWidth
            };
        }
        return elementRectangle;
    }
};
