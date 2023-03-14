import { PlaitBoard, Point } from '@plait/core';
import { FlowEdge } from '../interfaces';
import { getHandlesByEdge } from './get-handles-by-edge';
import { getHandlePosition } from '../utils';
import { HANDLE_DIAMETER } from '../constants';

export function getHandleSource(point: Point, board: PlaitBoard, edge: FlowEdge) {
    let handleSource = null;
    const handles = getHandlesByEdge(board, edge);
    handles.find(handle => {
        const position = getHandlePosition(handle.position, handle.nodeRect, handle);
        const distance = Math.pow(position.x - point[0], 2) + Math.pow(position.y - point[1], 2);
        if (distance < Math.pow(HANDLE_DIAMETER, 2)) {
            handleSource = handle.source;
        }
    });
    return handleSource;
}
