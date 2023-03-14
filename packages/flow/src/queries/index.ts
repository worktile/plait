import { getDefaultHandles } from './get-default-handles';
import { getEdgePoints } from './get-edge-points';
import { getEdgeHandles } from './get-edge-handles';
import { getFlowNodeById } from './get-node-by-id';
import { isHitFlowEdge } from './is-hit-flow-element';

export const FlowQueries = {
    getFlowNodeById,
    getDefaultHandles,
    getEdgePoints,
    getEdgeHandles,
    isHitFlowEdge
};
