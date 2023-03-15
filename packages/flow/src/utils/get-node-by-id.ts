import { PlaitBoard } from '@plait/core';
import { FlowNode } from '../interfaces/node';

export function getFlowNodeById(board: PlaitBoard, id: string): FlowNode {
    return board.children.find(item => item.id === id) as FlowNode;
}
