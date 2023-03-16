import { PlaitBoard, normalizePoint } from '@plait/core';
import { FlowEdge, FlowEdgeHandle } from '../../interfaces/edge';
import { getFlowNodeById } from '../get-node-by-id';

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
        handles.push({
            position: edges.source.position,
            node: sourceNode,
            source: 'source'
        });
    }
    if (edges.target) {
        targetNode = getFlowNodeById(board, edges.target.id);
        const { x, y } = normalizePoint(targetNode.points![0]);
        handles.push({
            position: edges.target.position,
            node: targetNode,
            source: 'target'
        });
    }
    return handles;
};
