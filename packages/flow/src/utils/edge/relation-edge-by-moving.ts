import { PlaitBoard } from '@plait/core';
import { FlowEdge } from '../../interfaces/edge';

export const isRelationEdgeByMoving = (board: PlaitBoard, edge: FlowEdge) => {
    return !!FLOW_RELATION_EDGE_BY_MOVING_INFO.get(board)?.find(item => item.id === edge.id);
};

export const addRelationEdgeByMovingInfo = (board: PlaitBoard, edges: FlowEdge[]) => {
    const edgeElements = getRelationEdgeByMovingInfo(board);
    FLOW_RELATION_EDGE_BY_MOVING_INFO.set(board, [...edgeElements, ...edges]);
};

export const clearRelationEdgeByMovingInfo = (board: PlaitBoard) => {
    FLOW_RELATION_EDGE_BY_MOVING_INFO.set(board, []);
};

export const getRelationEdgeByMovingInfo = (board: PlaitBoard) => {
    return FLOW_RELATION_EDGE_BY_MOVING_INFO.get(board) || [];
};

export const FLOW_RELATION_EDGE_BY_MOVING_INFO: WeakMap<PlaitBoard, FlowEdge[]> = new WeakMap();
