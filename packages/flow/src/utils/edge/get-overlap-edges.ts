import { PlaitBoard } from '@plait/core';
import { FlowElementType } from '../../interfaces/element';
import { FlowEdge } from '../../interfaces/edge';
import { getFlowElementsByType } from '../node/get-node';

export const getOverlapEdges = (board: PlaitBoard, edge: FlowEdge): FlowEdge[] => {
    const edges = getFlowElementsByType(board, FlowElementType.edge) as FlowEdge[];
    const sameEdges: FlowEdge[] = [];
    const overlapEdges: FlowEdge[] = [];
    edges.forEach(item => {
        if (
            item.source?.nodeId === edge.target?.nodeId &&
            item.target.nodeId === edge.source?.nodeId &&
            item.source?.position === edge.target?.position &&
            item.target?.position === edge.source?.position &&
            item?.shape === edge?.shape
        ) {
            overlapEdges.push(item);
        } else if (
            item.target?.nodeId === edge.target?.nodeId &&
            item.source?.nodeId === edge.source?.nodeId &&
            item.target?.position === edge.target?.position &&
            item.source?.position === edge.source?.position &&
            item?.shape === edge?.shape
        ) {
            sameEdges.push(item);
        }
    });
    return [...sameEdges, ...overlapEdges];
};
