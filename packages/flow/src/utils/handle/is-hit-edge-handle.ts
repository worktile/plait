import { PlaitBoard, Point, distanceBetweenPointAndPoint, normalizePoint } from '@plait/core';
import { FlowEdge } from '../../interfaces/edge';
import { getEdgeHandles } from './get-edge-handles';
import { HANDLE_DIAMETER } from '../../constants/handle';
import { getHandleXYPosition } from './get-handle-position';

export function isHitEdgeHandle(board: PlaitBoard, edge: FlowEdge, point: Point): boolean {
    let isHitHandle = false;
    const handles = getEdgeHandles(board, edge);
    handles.find(handle => {
        const { x, y } = normalizePoint(handle.node.points![0]);
        const position = getHandleXYPosition(
            handle.position,
            {
                x,
                y,
                width: handle.node.width,
                height: handle.node.height
            },
            handle
        );
        const distance = distanceBetweenPointAndPoint(position.x, position.y, point[0], point[1]);
        if (distance < HANDLE_DIAMETER / 2) {
            isHitHandle = true;
        }
    });
    return isHitHandle;
}
