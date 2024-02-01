import { PlaitBoard, Point, RectangleClient, distanceBetweenPointAndSegments } from '@plait/core';
import { LineShape, PlaitLine } from '../../interfaces';
import { RESIZE_HANDLE_DIAMETER, getPointOnPolyline } from '@plait/common';
import { getLinePoints, getMiddlePoints } from '../line/line-basic';

export enum LineResizeHandle {
    'source' = 'source',
    'target' = 'target',
    'addHandle' = 'addHandle'
}

export const getHitLineResizeHandleRef = (board: PlaitBoard, element: PlaitLine, point: Point) => {
    let dataPoints = PlaitLine.getPoints(board, element);
    const index = getHitPointIndex(dataPoints, point);
    if (index !== -1) {
        const handleIndex = index;
        if (index === 0) {
            return { handle: LineResizeHandle.source, handleIndex };
        }
        if (index === dataPoints.length - 1) {
            return { handle: LineResizeHandle.target, handleIndex };
        }
        // elbow line, data points only verify source connection point and target connection point
        if (element.shape !== LineShape.elbow) {
            return { handleIndex };
        }
    }
    const middlePoints = getMiddlePoints(board, element);
    const indexOfMiddlePoints = getHitPointIndex(middlePoints, point);
    if (indexOfMiddlePoints !== -1) {
        return {
            handle: LineResizeHandle.addHandle,
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

export const getHitLineTextIndex = (board: PlaitBoard, element: PlaitLine, point: Point) => {
    const texts = element.texts;
    if (!texts.length) return -1;

    const points = getLinePoints(board, element);
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
