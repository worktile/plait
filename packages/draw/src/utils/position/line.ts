import { PlaitBoard, Point, RectangleClient, drawCircle } from '@plait/core';
import { PlaitLine } from '../../interfaces';
import { PRIMARY_COLOR, RESIZE_HANDLE_DIAMETER } from '@plait/common';
import { getMiddlePoints } from '../../generators/line-active.generator';

export enum LineResizeHandle {
    'source' = 'source',
    'target' = 'target',
    'addHandle' = 'addHandle'
}

export const getHitLineResizeHandleRef = (board: PlaitBoard, element: PlaitLine, point: Point) => {
    const points = PlaitLine.getPoints(board, element);
    const index = getHitPointIndex(points, point);
    if (index !== -1) {
        if (index === 0) {
            return { handle: LineResizeHandle.source, index };
        }
        if (index === points.length - 1) {
            return { handle: LineResizeHandle.target, index };
        }
        return { index };
    }

    const middlePoints = getMiddlePoints(board, element);
    const middleIndex = getHitPointIndex(middlePoints, point);
    if (middleIndex !== -1) {
        return {
            handle: LineResizeHandle.addHandle,
            index: middleIndex
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

export function createUpdateHandle(board: PlaitBoard, point: Point) {
    return drawCircle(PlaitBoard.getRoughSVG(board), point, RESIZE_HANDLE_DIAMETER, {
        stroke: '#999999',
        strokeWidth: 1,
        fill: '#FFF',
        fillStyle: 'solid'
    });
}

export function createAddHandle(board: PlaitBoard, point: Point) {
    return drawCircle(PlaitBoard.getRoughSVG(board), point, RESIZE_HANDLE_DIAMETER, {
        stroke: '#FFFFFF80',
        strokeWidth: 1,
        fill: `${PRIMARY_COLOR}80`,
        fillStyle: 'solid'
    });
}
