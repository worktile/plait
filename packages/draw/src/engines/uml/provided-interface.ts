import {
    PlaitBoard,
    Point,
    PointOfRectangle,
    RectangleClient,
    distanceBetweenPointAndPoint,
    getEllipseTangentSlope,
    getNearestPointBetweenPointAndEllipse,
    getNearestPointBetweenPointAndSegments,
    getVectorFromPointAndSlope,
    setStrokeLinecap
} from '@plait/core';
import { ShapeEngine } from '../../interfaces';
import { Options } from 'roughjs/bin/core';
import { getUnitVectorByPointAndPoint } from '@plait/common';

const percentage = 0.54;

export const getStartPoint = (rectangle: RectangleClient): Point => {
    return [rectangle.x, rectangle.y + rectangle.height / 2];
};

export const getEndPoint = (rectangle: RectangleClient): Point => {
    return [rectangle.x + rectangle.width * percentage, rectangle.y + rectangle.height / 2];
};

export const arcPercentage = percentage + (1 - percentage) / 2;

export const getArcCenter = (rectangle: RectangleClient): Point => {
    return [rectangle.x + arcPercentage * rectangle.width, rectangle.y + rectangle.height / 2];
};

export const ProvidedInterfaceEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        const rs = PlaitBoard.getRoughSVG(board);
        const startPoint = getStartPoint(rectangle);
        const endPoint = getEndPoint(rectangle);
        const shape = rs.path(
            `M${startPoint[0]} ${startPoint[1]} 
        H${endPoint[0]}
        A${(rectangle.width * (1 - percentage)) / 2} ${rectangle.height / 2}, 0, 1, 1 ${rectangle.x + rectangle.width} ${
                rectangle.y + rectangle.height / 2
            }
        A${(rectangle.width * (1 - percentage)) / 2} ${rectangle.height / 2}, 0, 1, 1 ${rectangle.x + rectangle.width * percentage} ${
                rectangle.y + rectangle.height / 2
            }`,
            {
                ...options,
                fillStyle: 'solid'
            }
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
    getConnectorPoints(rectangle: RectangleClient) {
        return RectangleClient.getEdgeCenterPoints(rectangle);
    },
    getNearestPoint(rectangle: RectangleClient, point: Point) {
        const startPoint = getStartPoint(rectangle);
        const endPoint = getEndPoint(rectangle);
        const nearestPointForLine = getNearestPointBetweenPointAndSegments(point, [startPoint, endPoint]);
        const distanceForLine = distanceBetweenPointAndPoint(...point, ...nearestPointForLine);
        const arcCenter = getArcCenter(rectangle);
        const nearestPointForEllipse = getNearestPointBetweenPointAndEllipse(
            point,
            arcCenter,
            (rectangle.width * (1 - percentage)) / 2,
            rectangle.height / 2
        );
        const distanceForEllipse = distanceBetweenPointAndPoint(...point, ...nearestPointForEllipse);
        if (distanceForLine < distanceForEllipse) {
            return nearestPointForLine;
        }
        return nearestPointForEllipse;
    },
    getTangentVectorByConnectionPoint(rectangle: RectangleClient, pointOfRectangle: PointOfRectangle) {
        const connectionPoint = RectangleClient.getConnectionPoint(rectangle, pointOfRectangle);
        const centerPoint: Point = [rectangle.x + (rectangle.width * 3) / 4, rectangle.y + rectangle.height / 2];
        if (connectionPoint[0] > rectangle.x + rectangle.width * 0.54) {
            const point = [connectionPoint[0] - centerPoint[0], -(connectionPoint[1] - centerPoint[1])];
            const rx = (rectangle.width * 0.46) / 2;
            const ry = rectangle.height / 2;
            const slope = getEllipseTangentSlope(point[0], point[1], rx, ry) as any;
            return getVectorFromPointAndSlope(point[0], point[1], slope);
        }
        return getUnitVectorByPointAndPoint(connectionPoint, [rectangle.x, rectangle.y + rectangle.height / 2]);
    }
};
