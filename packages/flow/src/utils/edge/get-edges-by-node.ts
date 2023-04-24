import { FlowEdge } from '../../interfaces/edge';
import { FlowElementType } from '../../interfaces/element';
import { PlaitBoard } from '@plait/core';
import { getFlowElementsByType } from '../node/get-node';

export const getEdgesByNodeId = (board: PlaitBoard, nodeId: string) => {
    const edges = getFlowElementsByType(board, FlowElementType.edge) as FlowEdge[];
    return edges.filter(item => item.target.id === nodeId || item.source?.id === nodeId);
};
