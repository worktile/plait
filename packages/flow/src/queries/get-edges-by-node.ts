import { PlaitBoard } from '@plait/core';
import { FlowElement, FlowNode, isFlowEdgeElement } from '../interfaces';

export const getEdgesByNode = (board: PlaitBoard, node: FlowNode) => {
    const edges = (board.children as FlowElement[]).filter(item => {
        if (isFlowEdgeElement(item)) {
            return item.source?.id === node.id || item.target?.id === node.id;
        }
        return false;
    });
    return edges;
};
