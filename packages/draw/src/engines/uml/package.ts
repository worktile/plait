import {
    PlaitBoard,
    Point,
    PointOfRectangle,
    RectangleClient,
    getNearestPointBetweenPointAndSegments,
    setStrokeLinecap
} from '@plait/core';
import { getUnitVectorByPointAndPoint } from '@plait/common';
import { MultipleTextGeometryCommonTextKeys, PlaitMultipleTextGeometry, ShapeEngine } from '../../interfaces';
import { Options } from 'roughjs/bin/core';
import { RectangleEngine } from '../basic-shapes/rectangle';
import { getElementTextKeyByName, getStrokeWidthByElement } from '../../utils';
import { ShapeDefaultSpace } from '../../constants';
import { PlaitDrawShapeText } from '../../generators/text.generator';

export const PackageEngine: ShapeEngine<PlaitMultipleTextGeometry, {}, PlaitDrawShapeText> = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        const rs = PlaitBoard.getRoughSVG(board);
        const shape = rs.path(
            `M${rectangle.x} ${rectangle.y + 25} 
            V${rectangle.y}
            H${rectangle.x + rectangle.width * 0.7} 
            L${rectangle.x + rectangle.width * 0.8} ${rectangle.y + 25} 
            H${rectangle.x + rectangle.width} 
            V${rectangle.y + rectangle.height}
            H${rectangle.x}
            V${rectangle.y + 25}
            H${rectangle.x + rectangle.width * 0.8}`,
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
        let nearestPoint = getNearestPointBetweenPointAndSegments(point, RectangleEngine.getCornerPoints(rectangle));
        if (nearestPoint[0] > rectangle.x + rectangle.width * 0.7 && nearestPoint[1] <= rectangle.y + 25) {
            nearestPoint = getNearestPointBetweenPointAndSegments(
                point,
                [
                    [rectangle.x + rectangle.width * 0.7, rectangle.y],
                    [rectangle.x + rectangle.width * 0.8, rectangle.y + 25],
                    [rectangle.x + rectangle.width, rectangle.y + 25]
                ],
                false
            );
        }
        return nearestPoint;
    },
    getConnectorPoints(rectangle: RectangleClient) {
        return RectangleClient.getEdgeCenterPoints(rectangle);
    },
    getTangentVectorByConnectionPoint(rectangle: RectangleClient, pointOfRectangle: PointOfRectangle) {
        const connectionPoint = RectangleClient.getConnectionPoint(rectangle, pointOfRectangle);
        if (connectionPoint[0] > rectangle.x + rectangle.width * 0.7 && connectionPoint[1] < rectangle.y + 25) {
            return getUnitVectorByPointAndPoint([rectangle.x + rectangle.width * 0.7, rectangle.y], connectionPoint);
        }
        return getUnitVectorByPointAndPoint([rectangle.x + rectangle.width * 0.8, rectangle.y + 25], connectionPoint);
    },
    getTextRectangle(element: PlaitMultipleTextGeometry, options?: PlaitDrawShapeText) {
        const elementRectangle = RectangleClient.getRectangleByPoints(element.points!);
        const strokeWidth = getStrokeWidthByElement(element);
        const textHeight = element.texts?.find(item => item.key === options?.key)?.textHeight!;
        if (options?.key === getElementTextKeyByName(element, MultipleTextGeometryCommonTextKeys.name)) {
            const width = elementRectangle.width * 0.7 - ShapeDefaultSpace.rectangleAndText - strokeWidth;
            return {
                height: textHeight,
                width: width > 0 ? width : 0,
                x: elementRectangle.x + ShapeDefaultSpace.rectangleAndText + strokeWidth,
                y: elementRectangle.y + (25 - textHeight) / 2
            };
        }
        if (options?.key === getElementTextKeyByName(element, MultipleTextGeometryCommonTextKeys.content)) {
            const width = elementRectangle.width - ShapeDefaultSpace.rectangleAndText * 2 - strokeWidth * 2;
            return {
                height: textHeight,
                width: width > 0 ? width : 0,
                x: elementRectangle.x + ShapeDefaultSpace.rectangleAndText + strokeWidth,
                y: elementRectangle.y + 25 + (elementRectangle.height - 25 - textHeight) / 2
            };
        }
        return elementRectangle;
    }
};
