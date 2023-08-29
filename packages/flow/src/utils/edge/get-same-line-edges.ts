import { PlaitBoard } from '@plait/core';
import { FlowElementType } from '../../interfaces/element';
import { FlowEdge } from '../../interfaces/edge';
import { getFlowElementsByType } from '../node/get-node';

export const getSameLineEdges = (
    board: PlaitBoard,
    edge: FlowEdge
): { sameDirectionEdges: FlowEdge[]; sameLineEdges: FlowEdge[]; count: number } => {
    const edges = getFlowElementsByType(board, FlowElementType.edge) as FlowEdge[];
    const sameLineEdges: FlowEdge[] = [];
    const sameDirectionEdges: FlowEdge[] = [];
    edges.forEach(item => {
        if (
            item.source?.nodeId === edge.target?.nodeId &&
            item.target.nodeId === edge.source?.nodeId &&
            item.source?.position === edge.target?.position &&
            item.target?.position === edge.source?.position
        ) {
            sameDirectionEdges.push(item);
        } else if (
            item.target?.nodeId === edge.target?.nodeId &&
            item.source?.nodeId === edge.source?.nodeId &&
            item.target?.position === edge.target?.position &&
            item.source?.position === edge.source?.position
        ) {
            sameLineEdges.push(item);
        }
    });
    return {
        sameDirectionEdges: sameDirectionEdges,
        sameLineEdges: sameLineEdges,
        count: sameLineEdges.length + sameDirectionEdges.length
    };
};
