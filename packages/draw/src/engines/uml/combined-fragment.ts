import {
    PlaitBoard,
    Point,
    PointOfRectangle,
    RectangleClient,
    getNearestPointBetweenPointAndSegments,
    setStrokeLinecap
} from '@plait/core';
import { DrawOptions, GeometryCommonTextKeys, PlaitMultipleTextGeometry, ShapeEngine } from '../../interfaces';
import { Options } from 'roughjs/bin/core';
import { getPolygonEdgeByConnectionPoint } from '../../utils/polygon';
import { RectangleEngine } from '../basic-shapes/rectangle';
import { getStrokeWidthByElement } from '../../utils';
import { ShapeDefaultSpace } from '../../constants';
import { DrawTextInfo } from '../../generators/text.generator';
import { getTextSize } from '../../utils/text-size';

export const CombinedFragmentEngine: ShapeEngine<PlaitMultipleTextGeometry, DrawOptions, DrawTextInfo> = {
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
    getTextRectangle(board: PlaitBoard, element: PlaitMultipleTextGeometry, options?: DrawTextInfo) {
        const elementRectangle = RectangleClient.getRectangleByPoints(element.points!);
        const strokeWidth = getStrokeWidthByElement(element);
        const textInfo = element.texts?.find((item) => item.id === options?.id);
        if (options?.id === GeometryCommonTextKeys.name && textInfo) {
            const width = elementRectangle.width / 3 - 8 - ShapeDefaultSpace.rectangleAndText - strokeWidth;
            const textSize = getTextSize(board, textInfo!.text, width);
            return {
                height: textSize.height,
                width: width > 0 ? width : 0,
                x: elementRectangle.x + ShapeDefaultSpace.rectangleAndText + strokeWidth,
                y: elementRectangle.y + (25 - textSize.height) / 2
            };
        }
        if (options?.id === GeometryCommonTextKeys.content && textInfo) {
            const width = elementRectangle.width - ShapeDefaultSpace.rectangleAndText * 2 - strokeWidth * 2;
            const textSize = getTextSize(board, textInfo!.text, width);
            return {
                height: textSize.height,
                width: width > 0 ? width : 0,
                x: elementRectangle.x + ShapeDefaultSpace.rectangleAndText + strokeWidth,
                y: elementRectangle.y + 25 + ShapeDefaultSpace.rectangleAndText + strokeWidth
            };
        }
        return elementRectangle;
    }
};
