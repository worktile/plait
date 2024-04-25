import { PlaitBoard, PlaitElement, PlaitPlugin, getMovingElements, isSelectedElement, toHostPoint, toViewBoxPoint } from '@plait/core';
import { FlowNode } from '../interfaces/node';
import { FlowEdge } from '../interfaces/edge';
import { getHitEdge, getHitNode, isEdgeDragging, isPlaceholderEdgeInfo, setEdgeState, setRelatedEdgeState } from '../utils';
import { PlaitCommonElementRef } from '@plait/common';
import { NodeActiveGenerator } from '../generators/node-active.generator';

export const withHoverHighlight: PlaitPlugin = (board: PlaitBoard) => {
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
        if (hoveredElement) {
            const selected = isSelectedElement(board, hoveredElement);
            if (FlowNode.isFlowNodeElement(hoveredElement)) {
                const elementRef = PlaitElement.getElementRef<PlaitCommonElementRef>(hoveredElement);
                const handleGenerator = elementRef.getGenerator<NodeActiveGenerator>(NodeActiveGenerator.key);
                if (!selected) {
                    handleGenerator.destroy();
                }
                setRelatedEdgeState(board, hoveredElement.id, false);
            } else {
                setEdgeState(board, hoveredElement, false);
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
                setRelatedEdgeState(board, hoveredElement.id, true);
            } else {
                setEdgeState(board, hoveredElement, true);
            }
        }
    };

    board.pointerLeave = (event: PointerEvent) => {
        hoveredElement = null;
        pointerLeave(event);
    };

    return board;
};
