import { PlaitBoard, normalizePoint } from '@plait/core';
import { FlowEdge, FlowEdgeHandle } from '../interfaces';
import { getFlowNodeById } from './get-node-by-id';

/**
 * getEdgeHandles
 * @param board PlaitBoard
 * @param edges FlowEdge
 * @returns FlowEdgeHandle[]
 */

export const getEdgeHandles = (board: PlaitBoard, edges: FlowEdge) => {
    const handles: FlowEdgeHandle[] = [];
    let sourceNode, targetNode;
    if (edges.source) {
        sourceNode = getFlowNodeById(board, edges.source.id);
        const { x, y } = normalizePoint(sourceNode.points![0]);
        handles.push({
            position: edges.source.position,
            node: sourceNode,
            nodeRect: {
                x,
                y,
                width: sourceNode.width,
                height: sourceNode.height
            },
            source: 'source'
        });
    }
    if (edges.target) {
        targetNode = getFlowNodeById(board, edges.target.id);
        const { x, y } = normalizePoint(targetNode.points![0]);
        handles.push({
            position: edges.target.position,
            node: targetNode,
            nodeRect: {
                x,
                y,
                width: targetNode.width,
                height: targetNode.height
            },
            source: 'target'
        });
    }
    return handles;
};
