import { PlaitBoard, Point, distanceBetweenPointAndPoint, normalizePoint } from '@plait/core';
import { FlowEdge, FlowEdgeHandleType } from '../../interfaces/edge';
import { getEdgeHandles } from './get-edge-handles';
import { HANDLE_RADIUS } from '../../constants/handle';
import { getHandleXYPosition } from './get-handle-position';

export function getHandleSource(point: Point, board: PlaitBoard, edge: FlowEdge): FlowEdgeHandleType | null {
    let handleSource = null;
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
        if (distance < Math.pow(HANDLE_RADIUS, 2)) {
            handleSource = handle.source;
        }
    });
    return handleSource;
}
