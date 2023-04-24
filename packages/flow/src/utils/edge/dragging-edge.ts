import { PlaitBoard } from '@plait/core';
import { getFlowElementsByType } from '../node/get-node';
import { FlowElement, FlowElementType } from '../../interfaces/element';
import { FlowEdge, FlowEdgeDragInfo } from '../../interfaces/edge';

export const isEdgeDragging = (board: PlaitBoard) => {
    const edges = getFlowElementsByType(board, FlowElementType.edge) as FlowElement[];
    return edges.some(item => FLOW_EDGE_DRAGGING_INFO.get(item));
};

export const addEdgeDraggingInfo = (edge: FlowEdge, data: FlowEdgeDragInfo) => {
    FLOW_EDGE_DRAGGING_INFO.set(edge, data);
};

export const deleteEdgeDraggingInfo = (edge: FlowEdge) => {
    FLOW_EDGE_DRAGGING_INFO.delete(edge);
};

export const getEdgeDraggingInfo = (edge: FlowEdge) => {
    return FLOW_EDGE_DRAGGING_INFO.get(edge);
};

export const FLOW_EDGE_DRAGGING_INFO: WeakMap<FlowElement, FlowEdgeDragInfo> = new WeakMap();
