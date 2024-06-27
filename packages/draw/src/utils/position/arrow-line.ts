import { PlaitBoard, Point, RectangleClient, distanceBetweenPointAndSegments } from '@plait/core';
import { ArrowLineShape, PlaitArrowLine } from '../../interfaces';
import { RESIZE_HANDLE_DIAMETER, getPointOnPolyline } from '@plait/common';
import { getArrowLinePoints, getMiddlePoints } from '../arrow-line/arrow-line-basic';

export enum ArrowLineResizeHandle {
    'source' = 'source',
    'target' = 'target',
    'addHandle' = 'addHandle'
}

export const getHitArrowLineResizeHandleRef = (board: PlaitBoard, element: PlaitArrowLine, point: Point) => {
    let dataPoints = PlaitArrowLine.getPoints(board, element);
    const index = getHitPointIndex(dataPoints, point);
    if (index !== -1) {
        const handleIndex = index;
        if (index === 0) {
            return { handle: ArrowLineResizeHandle.source, handleIndex };
        }
        if (index === dataPoints.length - 1) {
            return { handle: ArrowLineResizeHandle.target, handleIndex };
        }
        // elbow line, data points only verify source connection point and target connection point
        if (element.shape !== ArrowLineShape.elbow) {
            return { handleIndex };
        }
    }
    const middlePoints = getMiddlePoints(board, element);
    const indexOfMiddlePoints = getHitPointIndex(middlePoints, point);
    if (indexOfMiddlePoints !== -1) {
        return {
            handle: ArrowLineResizeHandle.addHandle,
            handleIndex: indexOfMiddlePoints
        };
    }
    return undefined;
};

export function getHitPointIndex(points: Point[], movingPoint: Point) {
    const rectangles = points.map(point => {
        return {
            x: point[0] - RESIZE_HANDLE_DIAMETER / 2,
            y: point[1] - RESIZE_HANDLE_DIAMETER / 2,
            width: RESIZE_HANDLE_DIAMETER,
            height: RESIZE_HANDLE_DIAMETER
        };
    });
    const rectangle = rectangles.find(rectangle => {
        return RectangleClient.isHit(RectangleClient.getRectangleByPoints([movingPoint, movingPoint]), rectangle);
    });
    return rectangle ? rectangles.indexOf(rectangle) : -1;
}

export const getHitArrowLineTextIndex = (board: PlaitBoard, element: PlaitArrowLine, point: Point) => {
    const texts = element.texts;
    if (!texts.length) return -1;

    const points = getArrowLinePoints(board, element);
    return texts.findIndex(text => {
        const center = getPointOnPolyline(points, text.position);
        const rectangle = {
            x: center[0] - text.width! / 2,
            y: center[1] - text.height! / 2,
            width: text.width!,
            height: text.height!
        };
        return RectangleClient.isHit(rectangle, RectangleClient.getRectangleByPoints([point, point]));
    });
};
