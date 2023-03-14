import { PlaitBoard, RectangleClient } from '@plait/core';
import { FlowEdge, FlowEdgeHandle, FlowHandle } from '../interfaces';
import { getFlowNodeById } from './get-node-by-id';
import { getClientByNode } from './get-client-by-node';

/**
 * getHandlesByEdge
 * @param board PlaitBoard
 * @param edges FlowEdge
 * @returns FlowEdgeHandle[]
 */

export const getHandlesByEdge = (board: PlaitBoard, edges: FlowEdge) => {
    const handles: FlowEdgeHandle[] = [];
    let sourceNode, targetNode;
    if (edges.source) {
        sourceNode = getFlowNodeById(board, edges.source.id);
        handles.push({
            position: edges.source.position,
            nodeRect: getClientByNode(sourceNode),
            source: 'source'
        });
    }
    if (edges.target) {
        targetNode = getFlowNodeById(board, edges.target.id);
        handles.push({
            position: edges.target.position,
            nodeRect: getClientByNode(targetNode),
            source: 'target'
        });
    }
    return handles;
};
