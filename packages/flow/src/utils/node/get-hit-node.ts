import { PlaitBoard, Point } from '@plait/core';
import { getFlowElementsByType } from './get-node';
import { FlowElementType } from '../../interfaces/element';
import { FlowNode } from '../../interfaces/node';
import { isHitNode } from './is-hit-node';

export function getHitNode(board: PlaitBoard, point: Point): FlowNode | null {
    let flowNode: FlowNode | null = null;
    const flowNodes = getFlowElementsByType(board, FlowElementType.node) as FlowNode[];
    flowNodes.reverse().map((value, index) => {
        if (!flowNode && isHitNode(board, value, [point, point])) {
            flowNode = value;
        }
    });
    return flowNode;
}
