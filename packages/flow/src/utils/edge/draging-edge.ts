import { PlaitBoard } from '@plait/core';
import { getFlowElementsByType } from '../get-node-by-id';
import { FlowElement, FlowElementType } from '../../interfaces/element';
import { FlowEdge, FlowEdgeDragInfo } from '../../interfaces/edge';

export const isEdgeDraging = (board: PlaitBoard) => {
    const edges = getFlowElementsByType(board, FlowElementType.edge) as FlowElement[];
    return edges.some(item => FLOW_EDGE_DRAGING_INFO.get(item));
};

export const setEdgeDragingInfo = (edge: FlowEdge, data: FlowEdgeDragInfo) => {
    FLOW_EDGE_DRAGING_INFO.set(edge, data);
};

export const deleteEdgeDragingInfo = (edge: FlowEdge) => {
    FLOW_EDGE_DRAGING_INFO.delete(edge);
};

export const getEdgeDragingInfo = (edge: FlowEdge) => {
    return FLOW_EDGE_DRAGING_INFO.get(edge);
};

export const FLOW_EDGE_DRAGING_INFO: WeakMap<FlowElement, FlowEdgeDragInfo> = new WeakMap();
