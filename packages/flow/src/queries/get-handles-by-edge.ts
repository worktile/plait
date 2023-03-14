import { PlaitBoard } from '@plait/core';
import { FlowEdge } from '../interfaces';
import { getFlowNodeById } from './get-node-by-id';
import { getClientByNode } from './get-client-by-node';

export const getHandlesByEdge = (board: PlaitBoard, edges: FlowEdge) => {
    const handles = [];
    let sourceNode, targetNode;
    if (edges.source) {
        sourceNode = getFlowNodeById(board, edges.source.id);
        handles.push({
            position: edges.source.position,
            id: edges.source.handleId,
            nodeRect: getClientByNode(sourceNode),
            source: 'source'
        });
    }
    if (edges.target) {
        targetNode = getFlowNodeById(board, edges.target.id);
        handles.push({
            position: edges.target.position,
            id: edges.target.handleId,
            nodeRect: getClientByNode(targetNode),
            source: 'target'
        });
    }
    return handles;
};
