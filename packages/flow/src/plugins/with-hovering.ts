import { PlaitBoard, PlaitElement, PlaitPlugin, getMovingElements, toHostPoint, toViewBoxPoint } from '@plait/core';
import { FlowNode, NodeState } from '../interfaces/node';
import { FlowEdge } from '../interfaces/edge';
import { getHitEdge, getHitNode, isEdgeDragging, isPlaceholderEdgeInfo, renderEdge, renderRelatedEdges } from '../utils';
import { renderNode } from '../utils/edge/node-render';

export const withHovering: PlaitPlugin = (board: PlaitBoard) => {
    const { pointerMove, pointerLeave } = board;

    let hoveredElement: FlowNode | FlowEdge | null;

    board.pointerMove = (event: PointerEvent) => {
        pointerMove(event);
        const point = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
        const newHitNode = getHitNode(board, point) || getHitEdge(board, point);
        const movingNodes = getMovingElements(board);

        // 当移动节点、更改箭头方位、拖拽连线不执行
        if (movingNodes?.length || isEdgeDragging(board) || isPlaceholderEdgeInfo(board) || newHitNode?.id === hoveredElement?.id) {
            hoveredElement = newHitNode;
            return;
        }
        if (hoveredElement && PlaitElement.hasMounted(hoveredElement)) {
            if (FlowNode.isFlowNodeElement(hoveredElement)) {
                renderNode(board, hoveredElement.id);
                renderRelatedEdges(board, hoveredElement.id);
            } else {
                renderEdge(board, hoveredElement);
            }
        }
        hoveredElement = newHitNode;
        if (hoveredElement) {
            if (FlowNode.isFlowNodeElement(hoveredElement)) {
                renderNode(board, hoveredElement.id, NodeState.hovering);
                renderRelatedEdges(board, hoveredElement.id, 'hovering');
            } else {
                renderEdge(board, hoveredElement, 'hovering');
            }
        }
    };

    board.pointerLeave = (event: PointerEvent) => {
        hoveredElement = null;
        pointerLeave(event);
    };

    return board;
};
