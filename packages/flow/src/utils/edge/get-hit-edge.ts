import { PlaitBoard, Point } from '@plait/core';
import { FlowElementType } from '../../interfaces/element';
import { getFlowElementsByType } from '../node/get-node';
import { FlowEdge, isHitEdge } from '../../public-api';

export function getHitEdge(board: PlaitBoard, point: Point): FlowEdge | null {
    let flowEdge: FlowEdge | null = null;
    const flowEdges = getFlowElementsByType(board, FlowElementType.edge) as FlowEdge[];
    flowEdges.map((value, index) => {
        if (!flowEdge && isHitEdge(board, value, point)) {
            flowEdge = value;
        }
    });
    return flowEdge;
}
