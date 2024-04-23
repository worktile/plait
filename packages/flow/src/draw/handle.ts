import { RoughSVG } from 'roughjs/bin/svg';
import { PlaitBoard, normalizePoint } from '@plait/core';
import { getDefaultHandles } from '../utils/handle/get-default-handles';
import { FlowNode } from '../interfaces/node';
import { getHandleXYPosition } from '../utils/handle/get-handle-position';
import { FlowEdge } from '../interfaces/edge';
import { DEFAULT_HANDLE_STYLES, HANDLE_DIAMETER } from '../constants/handle';
import { getEdgeHandles } from '../utils/handle/edge';

export function drawNodeHandles(board: PlaitBoard, node: FlowNode) {
    const roughSVG = PlaitBoard.getRoughSVG(board);
    const handles = node.handles || getDefaultHandles();
    const { x, y } = normalizePoint(node.points![0]);
    return handles.map(handle => {
        const position = getHandleXYPosition(
            handle.position,
            {
                x,
                y,
                width: node.width,
                height: node.height
            },
            handle
        );
        return roughSVG.circle(position.x, position.y, HANDLE_DIAMETER, DEFAULT_HANDLE_STYLES);
    });
}

export function drawEdgeHandles(board: PlaitBoard, roughSVG: RoughSVG, edge: FlowEdge) {
    const handles = getEdgeHandles(board, edge);
    return handles.map(handle => {
        let { x, y } = normalizePoint(handle.node.points![0]);
        const position = getHandleXYPosition(
            handle.position,
            {
                x: x,
                y: y,
                width: handle.node.width,
                height: handle.node.height
            },
            handle
        );
        return roughSVG.circle(position.x, position.y, HANDLE_DIAMETER, DEFAULT_HANDLE_STYLES);
    });
}
