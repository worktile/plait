import { getClientByNode } from './get-client-by-node';
import { getDefaultHandles } from './get-default-handles';
import { getEdgePoints } from './get-edge-points';
import { getHandlesByEdge } from './get-handles-by-edge';
import { getFlowNodeById } from './get-node-by-id';
import { isHitFlowEdge } from './is-hit-flow-element';

export const FlowQueries = {
    getFlowNodeById,
    getClientByNode,
    getDefaultHandles,
    getEdgePoints,
    getHandlesByEdge,
    isHitFlowEdge
};
