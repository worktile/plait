import { PlaitBoard, PlaitElement, PlaitPlugin, getMovingElements, isSelectedElement, toHostPoint, toViewBoxPoint } from '@plait/core';
import { FlowNode } from '../interfaces/node';
import { FlowEdge } from '../interfaces/edge';
import { getHitEdge, getHitNode, isEdgeDragging, isPlaceholderEdgeInfo, renderEdge, renderRelatedEdges } from '../utils';
import { PlaitCommonElementRef } from '@plait/common';
import { NodeActiveGenerator } from '../generators/node-active.generator';

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
            const selected = isSelectedElement(board, hoveredElement);
            if (FlowNode.isFlowNodeElement(hoveredElement)) {
                const elementRef = PlaitElement.getElementRef<PlaitCommonElementRef>(hoveredElement);
                const handleGenerator = elementRef.getGenerator<NodeActiveGenerator>(NodeActiveGenerator.key);
                if (!selected) {
                    handleGenerator.destroy();
                }
                renderRelatedEdges(board, hoveredElement.id);
            } else {
                renderEdge(board, hoveredElement);
            }
        }
        hoveredElement = newHitNode;
        if (hoveredElement) {
            const selected = isSelectedElement(board, hoveredElement);
            if (FlowNode.isFlowNodeElement(hoveredElement)) {
                const elementRef = PlaitElement.getElementRef<PlaitCommonElementRef>(hoveredElement);
                const handleGenerator = elementRef.getGenerator<NodeActiveGenerator>(NodeActiveGenerator.key);
                if (!selected) {
                    handleGenerator.processDrawing(hoveredElement, PlaitBoard.getElementActiveHost(board), { selected, hovered: true });
                }
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
