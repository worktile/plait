import {
    PlaitBoard,
    Point,
    PointOfRectangle,
    RectangleClient,
    getEllipseTangentSlope,
    getNearestPointBetweenPointAndEllipse,
    getNearestPointBetweenPointAndSegments,
    getVectorFromPointAndSlope,
    isPointInEllipse,
    setStrokeLinecap
} from '@plait/core';
import { PlaitGeometry, ShapeEngine } from '../../interfaces';
import { ShapeDefaultSpace } from '../../constants';
import { Options } from 'roughjs/bin/core';
import { RectangleEngine } from '../basic-shapes/rectangle';
import { getStrokeWidthByElement } from '../../utils';

export const DatabaseEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        const rs = PlaitBoard.getRoughSVG(board);
        const shape = rs.path(
            `M${rectangle.x} ${rectangle.y + rectangle.height * 0.15}  
            A${rectangle.width / 2} ${rectangle.height * 0.15}, 0, 0, 0,${rectangle.x + rectangle.width} ${rectangle.y +
                rectangle.height * 0.15} 
            A${rectangle.width / 2} ${rectangle.height * 0.15}, 0, 0, 0,${rectangle.x} ${rectangle.y + rectangle.height * 0.15} 
            V${rectangle.y + rectangle.height - rectangle.height * 0.15}
            A${rectangle.width / 2} ${rectangle.height * 0.15}, 0, 0, 0, ${rectangle.x + rectangle.width} ${rectangle.y +
                rectangle.height -
                rectangle.height * 0.15}
            V${rectangle.y + rectangle.height * 0.15}`,
            { ...options, fillStyle: 'solid' }
        );
        setStrokeLinecap(shape, 'round');
        return shape;
    },
    isInsidePoint(rectangle: RectangleClient, point: Point) {
        const rangeRectangle = RectangleClient.getRectangleByPoints([point, point]);
        const isInRectangle = RectangleClient.isHit(
            {
                ...rectangle,
                y: rectangle.y + rectangle.height * 0.15,
                height: rectangle.height - rectangle.height * 0.3
            },
            rangeRectangle
        );

        const isInTopEllipse = isPointInEllipse(
            point,
            [rectangle.x + rectangle.width / 2, rectangle.y + rectangle.height * 0.15],
            rectangle.width / 2,
            rectangle.height * 0.15
        );

        const isInBottomEllipse = isPointInEllipse(
            point,
            [rectangle.x + rectangle.width / 2, rectangle.y + rectangle.height - rectangle.height * 0.15],
            rectangle.width / 2,
            rectangle.height * 0.15
        );
        return isInRectangle || isInTopEllipse || isInBottomEllipse;
    },
    getCornerPoints(rectangle: RectangleClient) {
        return RectangleClient.getCornerPoints(rectangle);
    },

    getNearestPoint(rectangle: RectangleClient, point: Point) {
        const nearestPoint = getNearestPointBetweenPointAndSegments(point, RectangleEngine.getCornerPoints(rectangle));
        if (nearestPoint[1] < rectangle.y + rectangle.height * 0.15) {
            const centerPoint = [rectangle.x + rectangle.width / 2, rectangle.y + rectangle.height * 0.15] as Point;
            const nearestPoint = getNearestPointBetweenPointAndEllipse(point, centerPoint, rectangle.width / 2, rectangle.height * 0.15);
            if (nearestPoint[1] > centerPoint[1]) {
                nearestPoint[1] = centerPoint[1] * 2 - nearestPoint[1];
            }
            return nearestPoint;
        }
        if (nearestPoint[1] > rectangle.y + rectangle.height - rectangle.height * 0.15) {
            const centerPoint = [rectangle.x + rectangle.width / 2, rectangle.y + rectangle.height - rectangle.height * 0.15] as Point;
            const nearestPoint = getNearestPointBetweenPointAndEllipse(point, centerPoint, rectangle.width / 2, rectangle.height * 0.15);
            if (nearestPoint[1] < centerPoint[1]) {
                nearestPoint[1] = centerPoint[0] * 2 - nearestPoint[1];
            }
            return nearestPoint;
        }
        return nearestPoint;
    },

    getConnectorPoints(rectangle: RectangleClient) {
        return RectangleClient.getEdgeCenterPoints(rectangle);
    },

    getTangentVectorByConnectionPoint(rectangle: RectangleClient, pointOfRectangle: PointOfRectangle) {
        const connectionPoint = RectangleClient.getConnectionPoint(rectangle, pointOfRectangle);
        let centerPoint = [rectangle.x + rectangle.width / 2, rectangle.y + rectangle.height - rectangle.height * 0.15];
        let a = rectangle.width / 2;
        let b = rectangle.height * 0.15;
        const isInTopEllipse = connectionPoint[1] < rectangle.y + rectangle.height * 0.15 && connectionPoint[0] > rectangle.x;
        if (isInTopEllipse) {
            centerPoint = [rectangle.x + rectangle.width / 2, rectangle.y + rectangle.height * 0.15];
        }
        const point = [connectionPoint[0] - centerPoint[0], -(connectionPoint[1] - centerPoint[1])];
        const slope = getEllipseTangentSlope(point[0], point[1], a, b) as any;
        const vector = getVectorFromPointAndSlope(point[0], point[1], slope);
        return vector;
    },

    getTextRectangle: (element: PlaitGeometry) => {
        const elementRectangle = RectangleClient.getRectangleByPoints(element.points!);
        const strokeWidth = getStrokeWidthByElement(element);
        const height = element.textHeight!;
        const width = elementRectangle.width - ShapeDefaultSpace.rectangleAndText * 2 - strokeWidth * 2;
        return {
            height,
            width: width > 0 ? width : 0,
            x: elementRectangle.x + ShapeDefaultSpace.rectangleAndText + strokeWidth,
            y: elementRectangle.y + elementRectangle.height * 0.3 + (elementRectangle.height - elementRectangle.height * 0.45 - height) / 2
        };
    }
};
