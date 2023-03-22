import { PlaitBoard } from '@plait/core';
import { FlowNode } from '../interfaces/node';

export function getFlowNodeById(board: PlaitBoard, id: string): FlowNode {
    let node = board.children.find(item => item.id === id) as FlowNode;
    return node;
}

export function getFakeFlowNodeById(board: PlaitBoard, id: string, offsetX = 0, offsetY = 0): FlowNode {
    const node = getFlowNodeById(board, id);
    const [x, y] = node.points![0];
    return {
        ...node,
        points: [[x + offsetX, y + offsetY]]
    };
}
