import { PlaitBoard, Point, RectangleClient, isSelectedElement, normalizePoint } from '@plait/core';
import { FlowNode } from '../../interfaces/node';
import { OUTLINE_BUFFER } from '../../constants/node';

export function isHitFlowNode(board: PlaitBoard, node: FlowNode, point: [Point, Point]) {
    const { x, y } = normalizePoint(node.points![0]);
    const isSelected = isSelectedElement(board, node);
    return RectangleClient.isIntersect(RectangleClient.toRectangleClient(point), {
        x: isSelected ? x : x + OUTLINE_BUFFER,
        y: isSelected ? y : y + OUTLINE_BUFFER,
        width: isSelected ? node.width : node.width - OUTLINE_BUFFER * 2,
        height: isSelected ? node.height : node.height - OUTLINE_BUFFER * 2
    });
}
