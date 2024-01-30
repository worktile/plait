import { PlaitBoard, Point, RectangleClient, drawCircle } from '@plait/core';
import { LineShape, PlaitLine } from '../../interfaces';
import { PRIMARY_COLOR, RESIZE_HANDLE_DIAMETER } from '@plait/common';
import { getMiddlePoints } from '../../generators/line-active.generator';

export enum LineResizeHandle {
    'source' = 'source',
    'target' = 'target',
    'addHandle' = 'addHandle'
}

export const getHitLineResizeHandleRef = (board: PlaitBoard, element: PlaitLine, point: Point) => {
    let dataPoints = PlaitLine.getPoints(board, element);
    // elbow line, data points only verify source connection point and target connection point
    if (element.shape === LineShape.elbow) {
        dataPoints = [dataPoints[0], dataPoints[dataPoints.length - 1]];
    }
    const index = getHitPointIndex(dataPoints, point);
    if (index !== -1) {
        const handleIndex = index;
        if (index === 0) {
            return { handle: LineResizeHandle.source, handleIndex };
        }
        if (index === dataPoints.length - 1) {
            return { handle: LineResizeHandle.target, handleIndex };
        }
        return { handleIndex };
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
        return RectangleClient.isHit(RectangleClient.toRectangleClient([movingPoint, movingPoint]), rectangle);
    });
    return rectangle ? rectangles.indexOf(rectangle) : -1;
}
