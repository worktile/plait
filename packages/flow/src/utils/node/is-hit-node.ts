import { PlaitBoard, Point, RectangleClient, isSelectedElement, normalizePoint } from '@plait/core';
import { FlowNode } from '../../interfaces/node';
import { OUTLINE_BUFFR } from '../../constants/node';

export function isHitFlowNode(board: PlaitBoard, node: FlowNode, point: [Point, Point]) {
    const { x, y } = normalizePoint(node.points![0]);
    const isSelected = isSelectedElement(board, node);
    return RectangleClient.isIntersect(RectangleClient.toRectangleClient(point), {
        x: isSelected ? x : x + OUTLINE_BUFFR,
        y: isSelected ? y : y + OUTLINE_BUFFR,
        width: isSelected ? node.width : node.width - OUTLINE_BUFFR * 2,
        height: isSelected ? node.height : node.height - OUTLINE_BUFFR * 2
    });
}

export function isHitFlowNodeHandle(board: PlaitBoard, node: FlowNode, point: [Point, Point]) {
    // const { x, y } = normalizePoint(node.points![0]);
    // const isSelected = isSelectedElement(board, node);
    // return RectangleClient.isIntersect(RectangleClient.toRectangleClient(point), {
    //     x: isSelected ? x : x + OUTLINE_BUFFR,
    //     y: isSelected ? y : y + OUTLINE_BUFFR,
    //     width: isSelected ? node.width : node.width - OUTLINE_BUFFR * 2,
    //     height: isSelected ? node.height : node.height - OUTLINE_BUFFR * 2
    // });
}
