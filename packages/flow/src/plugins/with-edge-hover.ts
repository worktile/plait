import { PlaitBoard, PlaitElement, PlaitPlugin, getSelectedElements, toPoint, transformPoint } from '@plait/core';
import { FlowEdge, FlowElement, FlowNode, addEdgeHovered, getEdgesByNodeId, getHitEdge, removeEdgeHovered } from '../public-api';

export const withEdgeHover: PlaitPlugin = (board: PlaitBoard) => {
    const { mousemove, mouseup, mouseleave } = board;

    let activeElement: PlaitElement | null;
    let hoveredElement: FlowEdge | null;
    let relationEdges: FlowEdge[] | null;

    board.mouseup = (event: MouseEvent) => {
        mouseup(event);
        const selectedElement = getSelectedElements(board) && getSelectedElements(board)[0];
        if (activeElement && selectedElement !== activeElement && FlowEdge.isFlowEdgeElement(selectedElement as FlowElement)) {
            [...(relationEdges || []), activeElement]?.forEach(item => removeEdgeHovered(item as FlowEdge));
            activeElement = null;
        }
        activeElement = selectedElement;
        if (activeElement && FlowEdge.isFlowEdgeElement(activeElement as FlowElement)) {
            addEdgeHovered(activeElement as FlowEdge, true, false);
        }
    };

    board.mousemove = (event: MouseEvent) => {
        // 鼠标移入 edge 高亮
        event.preventDefault();
        const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
        const newHitEdge = getHitEdge(board, point);

        if (hoveredElement && FlowEdge.isFlowEdgeElement(hoveredElement as FlowElement)) {
            if (newHitEdge === hoveredElement) {
                return;
            }
            if (activeElement && FlowNode.isFlowNodeElement(activeElement as FlowElement)) {
                relationEdges = getEdgesByNodeId(board, activeElement.id);
                const isIncludeHoverEdge = relationEdges.find(item => item.id === hoveredElement!.id);
                if (!isIncludeHoverEdge) {
                    removeEdgeHovered(hoveredElement);
                }
            } else if (hoveredElement !== activeElement) {
                removeEdgeHovered(hoveredElement);
            }
        }
        hoveredElement = newHitEdge;
        if (hoveredElement && hoveredElement !== activeElement && FlowEdge.isFlowEdgeElement(hoveredElement as FlowElement)) {
            addEdgeHovered(hoveredElement);
        }
        mousemove(event);
    };

    board.mouseleave = (event: MouseEvent) => {
        mouseleave(event);
        if (hoveredElement) {
            removeEdgeHovered(hoveredElement);
            hoveredElement = null;
        }
    };

    return board;
};
