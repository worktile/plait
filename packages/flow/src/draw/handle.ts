import { RoughSVG } from 'roughjs/bin/svg';
import { FlowEdge, FlowHandle, FlowNode } from '../interfaces';
import { getClientByNode, getHandlePosition } from '../utils';
import { getHandlesByEdge } from '../queries/get-handles-by-edge';
import { PlaitBoard } from '@plait/core';
import { DEAFULT_HANDLE_STYLES, HANDLE_RADIUS } from '../constants';

/**
 * drawHandles
 * @param roughSVG RoughSVG
 * @param node FlowNode
 * @returns RoughSVG[]
 */
export function drawHandles(roughSVG: RoughSVG, handles: FlowHandle[], node: FlowNode) {
    const nodeRect = node && getClientByNode(node);
    return handles.map(handle => {
        const position = getHandlePosition(handle.position, nodeRect, handle);
        return roughSVG.circle(position.x, position.y, HANDLE_RADIUS, DEAFULT_HANDLE_STYLES);
    });
}

/**
 * drawEdgeHandles
 * @param board PlaitBoard
 * @param roughSVG RoughSVG
 * @param edges FlowEdge
 * @returns RoughSVG[]
 */
export function drawEdgeHandles(board: PlaitBoard, roughSVG: RoughSVG, edges: FlowEdge) {
    const handles = getHandlesByEdge(board, edges);
    return handles.map(handle => {
        const position = getHandlePosition(handle.position, handle.nodeRect, handle);
        return roughSVG.circle(position.x, position.y, HANDLE_RADIUS, DEAFULT_HANDLE_STYLES);
    });
}
