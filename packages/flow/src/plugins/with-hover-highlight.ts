import { PlaitBoard, PlaitElement, PlaitPlugin, getMovingElements, isSelectedElement, toHostPoint, toViewBoxPoint } from '@plait/core';
import { FlowNode } from '../interfaces/node';
import { FlowEdge } from '../interfaces/edge';
import { getEdgesByNodeId, getHitEdge, getHitNode, isEdgeDragging, isPlaceholderEdgeInfo, getHitHandleByNode } from '../utils';
import { FlowNodeComponent } from '../flow-node.component';
import { FlowRenderMode } from '../interfaces/flow';
import { FlowEdgeComponent } from '../flow-edge.component';
import { PlaitCommonElementRef } from '@plait/common';
import { NodeHandleGenerator } from '../generators/node-handle.generator';

export const withHoverHighlight: PlaitPlugin = (board: PlaitBoard) => {
    const { pointerMove, pointerLeave } = board;

    let hoveredElement: FlowNode | FlowEdge | null;
    let relationEdges: FlowEdge[] | null;

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
                const handleGenerator = elementRef.getGenerator<NodeHandleGenerator>(NodeHandleGenerator.key);
                if (!selected) {
                    handleGenerator.destroy();
                }
                (relationEdges || []).forEach(item => {
                    const component = PlaitElement.getComponent(item) as FlowEdgeComponent;
                    component && component.drawElement(item, FlowRenderMode.default);
                });
            } else {
                const hoveredComponent = PlaitElement.getComponent(hoveredElement);
                (hoveredComponent as FlowEdgeComponent)?.drawElement(hoveredElement, FlowRenderMode.default);
            }
        }
        hoveredElement = newHitNode;
        if (hoveredElement) {
            const selected = isSelectedElement(board, hoveredElement);
            if (FlowNode.isFlowNodeElement(hoveredElement)) {
                const elementRef = PlaitElement.getElementRef<PlaitCommonElementRef>(hoveredElement);
                const handleGenerator = elementRef.getGenerator<NodeHandleGenerator>(NodeHandleGenerator.key);
                if (!selected) {
                    handleGenerator.processDrawing(hoveredElement, PlaitBoard.getElementActiveHost(board), { selected, hovered: true });
                }
                relationEdges = getEdgesByNodeId(board, hoveredElement.id);
                (relationEdges || []).forEach(item => {
                    const component = PlaitElement.getComponent(item) as FlowEdgeComponent;
                    component && component.drawElement(item, FlowRenderMode.hover);
                });
            } else {
                const hoveredComponent = PlaitElement.getComponent(hoveredElement);
                (hoveredComponent as FlowEdgeComponent)?.drawElement(hoveredElement, FlowRenderMode.hover);
            }
        }
    };

    board.pointerLeave = (event: PointerEvent) => {
        hoveredElement = null;
        relationEdges = null;
        pointerLeave(event);
    };

    return board;
};
