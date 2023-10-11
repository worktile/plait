import { PlaitBoard, Point, RectangleClient } from '@plait/core';
import { PlaitLine } from '../../interfaces';
import { RESIZE_HANDLE_DIAMETER } from '@plait/common';
import { getLineHandlePoints } from '../line';

export enum LineResizeHandle {
    'source' = 'source',
    'target' = 'target'
}

export const getHitLineResizeHandleRef = (board: PlaitBoard, element: PlaitLine, point: Point) => {
    const [sourcePoint, targetPoint] = getLineHandlePoints(board, element);
    const sourceRectangle: RectangleClient = {
        x: sourcePoint[0] - RESIZE_HANDLE_DIAMETER / 2,
        y: sourcePoint[1] - RESIZE_HANDLE_DIAMETER / 2,
        width: RESIZE_HANDLE_DIAMETER,
        height: RESIZE_HANDLE_DIAMETER
    };
    const targetRectangle: RectangleClient = {
        x: targetPoint[0] - RESIZE_HANDLE_DIAMETER / 2,
        y: targetPoint[1] - RESIZE_HANDLE_DIAMETER / 2,
        width: RESIZE_HANDLE_DIAMETER,
        height: RESIZE_HANDLE_DIAMETER
    };
    const isHitSourceRectangle = RectangleClient.isHit(RectangleClient.toRectangleClient([point, point]), sourceRectangle);
    const isHitTargetRectangle = RectangleClient.isHit(RectangleClient.toRectangleClient([point, point]), targetRectangle);
    if (isHitSourceRectangle) {
        return { rectangle: sourceRectangle, handle: LineResizeHandle.source };
    }
    if (isHitTargetRectangle) {
        return { rectangle: targetRectangle, handle: LineResizeHandle.target };
    }
    return undefined;
};
