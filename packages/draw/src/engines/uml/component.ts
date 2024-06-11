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
import { RectangleEngine } from '../basic-shapes/rectangle';
import { getStrokeWidthByElement } from '../../utils';
import { ShapeDefaultSpace } from '../../constants';
import { getUnitVectorByPointAndPoint } from '@plait/common';

export const ComponentEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        const rs = PlaitBoard.getRoughSVG(board);
        const boxSize = {
            with: rectangle.width > 70 ? 24 : rectangle.width * 0.2,
            height: rectangle.height - 28 - rectangle.height * 0.35 > 1 ? 14 : rectangle.height * 0.175
        };
        const shape = rs.path(
            `M${rectangle.x + 12} ${rectangle.y} 
            v${rectangle.height * 0.175} 
            h${boxSize.with / 2} v${boxSize.height} h${-boxSize.with} v${-boxSize.height} h${boxSize.with / 2}

            M${rectangle.x + 12} ${rectangle.y + rectangle.height * 0.175 + boxSize.height} 

            v${rectangle.height - rectangle.height * 0.35 - boxSize.height * 2}
            h${boxSize.with / 2} v${boxSize.height} h${-boxSize.with} v${-boxSize.height} h${boxSize.with / 2}
            M${rectangle.x + 12} ${rectangle.y + rectangle.height - rectangle.height * 0.175} 
            V${rectangle.y + rectangle.height}
            H${rectangle.x + rectangle.width}
            v${-rectangle.height}
            h${-(rectangle.width - 12)}
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
        let nearestPoint = getNearestPointBetweenPointAndSegments(point, RectangleEngine.getCornerPoints(rectangle));
        if (nearestPoint[1] === rectangle.y + rectangle.height / 2) {
            nearestPoint = getNearestPointBetweenPointAndSegments(
                point,
                [
                    [rectangle.x + 12, rectangle.y + rectangle.height * 0.175 + 14],
                    [rectangle.x + 12, rectangle.y + rectangle.height - rectangle.height * 0.175 - 14]
                ],
                false
            );
        }
        return nearestPoint;
    },

    getTangentVectorByConnectionPoint(rectangle: RectangleClient, pointOfRectangle: PointOfRectangle) {
        const connectionPoint = RectangleClient.getConnectionPoint(rectangle, pointOfRectangle);
        return getUnitVectorByPointAndPoint(
            [rectangle.x + 12, rectangle.y + rectangle.height - rectangle.height * 0.175 - 14],
            connectionPoint
        );
    },
    getConnectorPoints(rectangle: RectangleClient) {
        return [
            [rectangle.x + rectangle.width / 2, rectangle.y],
            [rectangle.x + rectangle.width, rectangle.y + rectangle.height / 2],
            [rectangle.x + rectangle.width / 2, rectangle.y + rectangle.height],
            [rectangle.x + 12, rectangle.y + rectangle.height / 2]
        ] as [Point, Point, Point, Point];
    },
    getTextRectangle(element: PlaitGeometry) {
        const elementRectangle = RectangleClient.getRectangleByPoints(element.points!);
        const strokeWidth = getStrokeWidthByElement(element);
        const height = element.textHeight!;
        const width = elementRectangle.width - 24 - ShapeDefaultSpace.rectangleAndText * 2 - strokeWidth * 2;
        return {
            height,
            width: width > 0 ? width : 0,
            x: elementRectangle.x + 24 + ShapeDefaultSpace.rectangleAndText + strokeWidth,
            y: elementRectangle.y + (elementRectangle.height - height) / 2
        };
    }
};
