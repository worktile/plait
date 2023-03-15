import { RoughSVG } from 'roughjs/bin/svg';
import { PlaitBoard, normalizePoint } from '@plait/core';
import { DEAFULT_HANDLE_STYLES, HANDLE_RADIUS } from '../constants';
import { getDefaultHandles } from '../utils/handle/get-default-handles';
import { FlowNode } from '../interfaces/node';
import { FlowEdge } from '../interfaces/edge';
import { getHandlePosition } from '../utils/handle/get-handle-position';
import { getEdgeHandles } from '../utils/handle/get-edge-handles';

/**
 * drawHandles
 * @param roughSVG RoughSVG
 * @param node FlowNode
 * @returns RoughSVG[]
 */
export function drawNodeHandles(roughSVG: RoughSVG, node: FlowNode) {
    const handles = node.handles || getDefaultHandles();
    const { x, y } = normalizePoint(node.points![0]);
    return handles.map(handle => {
        const position = getHandlePosition(
            handle.position,
            {
                x,
                y,
                width: node.width,
                height: node.height
            },
            handle
        );
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
export function drawEdgeHandles(board: PlaitBoard, roughSVG: RoughSVG, edge: FlowEdge) {
    const handles = getEdgeHandles(board, edge);
    return handles.map(handle => {
        const { x, y } = normalizePoint(handle.node.points![0]);
        const position = getHandlePosition(
            handle.position,
            {
                x,
                y,
                width: handle.node.width,
                height: handle.node.height
            },
            handle
        );
        return roughSVG.circle(position.x, position.y, HANDLE_RADIUS, DEAFULT_HANDLE_STYLES);
    });
}
