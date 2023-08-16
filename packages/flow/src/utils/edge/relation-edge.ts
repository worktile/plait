import { FlowEdge } from '../../interfaces/edge';

export const addRelationEdgeInfo = (edge: FlowEdge) => {
    FLOW_RELATION_EDGE_INFO.set(edge, edge.id);
};

export const deleteRelationEdgeInfo = (edge: FlowEdge) => {
    FLOW_RELATION_EDGE_INFO.delete(edge);
};

export const isRelationEdgeInfo = (edge: FlowEdge) => {
    return FLOW_RELATION_EDGE_INFO.get(edge);
};

export const FLOW_RELATION_EDGE_INFO: WeakMap<FlowEdge, string> = new WeakMap();
