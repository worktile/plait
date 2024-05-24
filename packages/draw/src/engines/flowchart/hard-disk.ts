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

export const HardDiskEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        const rs = PlaitBoard.getRoughSVG(board);
        const shape = rs.path(
            `M${rectangle.x + rectangle.width - rectangle.width * 0.15} ${rectangle.y}  
            A${rectangle.width * 0.15} ${rectangle.height / 2}, 0, 0, 0,${rectangle.x +
                rectangle.width -
                rectangle.width * 0.15} ${rectangle.y + rectangle.height} 
            A${rectangle.width * 0.15} ${rectangle.height / 2}, 0, 0, 0,${rectangle.x + rectangle.width - rectangle.width * 0.15} ${
                rectangle.y
            } 
            H${rectangle.x + rectangle.width * 0.15}
            A${rectangle.width * 0.15} ${rectangle.height / 2}, 0, 0, 0, ${rectangle.x + rectangle.width * 0.15} ${rectangle.y +
                rectangle.height}
            H${rectangle.x + rectangle.width - rectangle.width * 0.15}`,
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
                x: rectangle.x + rectangle.width * 0.15,
                width: rectangle.width - rectangle.width * 0.3
            },
            rangeRectangle
        );

        const isInLeftEllipse = isPointInEllipse(
            point,
            [rectangle.x + rectangle.width * 0.15, rectangle.y + rectangle.height / 2],
            rectangle.width * 0.15,
            rectangle.height / 2
        );

        const isInRightEllipse = isPointInEllipse(
            point,
            [rectangle.x + rectangle.width - rectangle.width * 0.15, rectangle.y + rectangle.height / 2],
            rectangle.width * 0.15,
            rectangle.height / 2
        );
        return isInRectangle || isInLeftEllipse || isInRightEllipse;
    },
    getCornerPoints(rectangle: RectangleClient) {
        return RectangleClient.getCornerPoints(rectangle);
    },
    getNearestPoint(rectangle: RectangleClient, point: Point) {
        const nearestPoint = getNearestPointBetweenPointAndSegments(point, RectangleEngine.getCornerPoints(rectangle));
        if (nearestPoint[0] < rectangle.x + rectangle.width * 0.15) {
            const centerPoint = [rectangle.x + rectangle.width * 0.15, rectangle.y + rectangle.height / 2] as Point;
            const nearestPoint = getNearestPointBetweenPointAndEllipse(point, centerPoint, rectangle.width * 0.15, rectangle.height / 2);
            if (nearestPoint[0] > centerPoint[0]) {
                nearestPoint[0] = centerPoint[0] * 2 - nearestPoint[0];
            }
            return nearestPoint;
        }
        if (nearestPoint[0] > rectangle.x + rectangle.width - rectangle.width * 0.15) {
            const centerPoint = [rectangle.x + rectangle.width - rectangle.width * 0.15, rectangle.y + rectangle.height / 2] as Point;
            const nearestPoint = getNearestPointBetweenPointAndEllipse(point, centerPoint, rectangle.width * 0.15, rectangle.height / 2);
            if (nearestPoint[0] < centerPoint[0]) {
                nearestPoint[0] = centerPoint[0] * 2 - nearestPoint[0];
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
        let centerPoint = [rectangle.x + rectangle.width * 0.15, rectangle.y + rectangle.height / 2];
        let a = rectangle.width * 0.15;
        let b = rectangle.height / 2;
        const isInRightEllipse =
            connectionPoint[0] > rectangle.x + rectangle.width - rectangle.width * 0.15 && connectionPoint[1] > rectangle.y;
        if (isInRightEllipse) {
            centerPoint = [rectangle.x + rectangle.width - rectangle.width * 0.15, rectangle.y + rectangle.height / 2];
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
        const width = elementRectangle.width - elementRectangle.width * 0.45 - ShapeDefaultSpace.rectangleAndText * 2 - strokeWidth * 2;
        return {
            height,
            width: width > 0 ? width : 0,
            x: elementRectangle.x + elementRectangle.width * 0.15 + ShapeDefaultSpace.rectangleAndText + strokeWidth,
            y: elementRectangle.y + (elementRectangle.height - height) / 2
        };
    }
};
