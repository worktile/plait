import { PlaitBoard, Point, RectangleClient, isSelectedElement, normalizePoint } from '@plait/core';
import { FlowNode } from '../../interfaces/node';
import { OUTLINE_BUFFER } from '../../constants/node';
import { getHitHandleByNode } from '../handle/node';

export function isHitNode(board: PlaitBoard, node: FlowNode, point: [Point, Point]) {
    const { x, y } = normalizePoint(node.points![0]);
    const isSelected = isSelectedElement(board, node);
    const isHitNodeHandle = !!getHitHandleByNode(node, point[0]);
    let hitFlowNode = RectangleClient.isHit(RectangleClient.getRectangleByPoints(point), {
        x: isSelected ? x : x + OUTLINE_BUFFER,
        y: isSelected ? y : y + OUTLINE_BUFFER,
        width: isSelected ? node.width : node.width - OUTLINE_BUFFER * 2,
        height: isSelected ? node.height : node.height - OUTLINE_BUFFER * 2
    });
    if (hitFlowNode || (isSelected && isHitNodeHandle)) {
        return true;
    }
    return false;
}
