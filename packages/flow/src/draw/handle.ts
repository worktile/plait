import { RoughSVG } from 'roughjs/bin/svg';
import { FlowEdge, FlowNode } from '../interfaces';
import { getHandlePosition } from '../utils';
import { getEdgeHandles } from '../queries/get-edge-handles';
import { PlaitBoard, normalizePoint } from '@plait/core';
import { DEAFULT_HANDLE_STYLES, HANDLE_RADIUS } from '../constants';
import { getDefaultHandles } from '../queries/get-default-handles';

/**
 * drawHandles
 * @param roughSVG RoughSVG
 * @param node FlowNode
 * @returns RoughSVG[]
 */
export function drawNodeHandles(roughSVG: RoughSVG, node: FlowNode) {
    const handles =  node.handles || getDefaultHandles()
    const { x, y } = normalizePoint(node.points![0]);
    return handles.map(handle => {
        const position = getHandlePosition(handle.position, {
            x,
            y,
            width: node.width,
            height: node.height
        }, handle);
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
    const handles = getEdgeHandles(board, edges);
    return handles.map(handle => {
        const position = getHandlePosition(handle.position, handle.nodeRect, handle);
        return roughSVG.circle(position.x, position.y, HANDLE_RADIUS, DEAFULT_HANDLE_STYLES);
    });
}
