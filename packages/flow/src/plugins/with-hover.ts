import { PlaitBoard, PlaitElement, PlaitPlugin, getMovingElements, getSelectedElements, toPoint, transformPoint } from '@plait/core';
import {
    FlowEdge,
    FlowEdgeComponent,
    FlowRenderMode,
    FlowNode,
    getEdgesByNodeId,
    getHitEdge,
    getHitNode,
    FlowNodeComponent,
    isEdgeDragging,
    isPlaceholderEdgeInfo
} from '../public-api';

export const withHover: PlaitPlugin = (board: PlaitBoard) => {
    const { mousemove, mouseleave } = board;

    let hoveredElement: FlowNode | FlowEdge | null;
    let relationEdges: FlowEdge[] | null;

    board.mousemove = (event: MouseEvent) => {
        event.preventDefault();
        const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
        const newHitNode = getHitNode(board, point) || getHitEdge(board, point);
        const activeElement = getSelectedElements(board) && getSelectedElements(board)[0];
        const movingNodes = getMovingElements(board);

        if (hoveredElement && !movingNodes?.length && !isEdgeDragging(board) && !isPlaceholderEdgeInfo(board)) {
            if (newHitNode?.id === hoveredElement.id) {
                return;
            }
            const hoveredComponent = PlaitElement.getComponent(hoveredElement);
            if (FlowNode.isFlowNodeElement(hoveredElement)) {
                if (hoveredElement.id !== activeElement?.id) {
                    (hoveredComponent as FlowNodeComponent)?.drawElement(hoveredElement, FlowRenderMode.default);
                }
                (relationEdges || []).forEach(item => {
                    if (item.id !== activeElement?.id) {
                        const component = PlaitElement.getComponent(item) as FlowEdgeComponent;
                        component && component.drawElement(item, FlowRenderMode.default);
                    }
                });
            } else {
                if (hoveredElement.id !== activeElement?.id) {
                    (hoveredComponent as FlowEdgeComponent)?.drawElement(hoveredElement, FlowRenderMode.default);
                }
            }
        }
        hoveredElement = newHitNode;
        if (hoveredElement && !movingNodes?.length && !isEdgeDragging(board) && !isPlaceholderEdgeInfo(board)) {
            const hoveredComponent = PlaitElement.getComponent(hoveredElement);
            if (FlowNode.isFlowNodeElement(hoveredElement)) {
                if (hoveredElement.id !== activeElement?.id) {
                    (hoveredComponent as FlowNodeComponent)?.drawElement(hoveredElement, FlowRenderMode.hover);
                }
                relationEdges = getEdgesByNodeId(board, hoveredElement.id);
                (relationEdges || []).forEach(item => {
                    if (item.id !== activeElement?.id) {
                        const component = PlaitElement.getComponent(item) as FlowEdgeComponent;
                        component && component.drawElement(item, FlowRenderMode.hover);
                    }
                });
            } else {
                if (hoveredElement.id !== activeElement?.id) {
                    (hoveredComponent as FlowEdgeComponent)?.drawElement(hoveredElement, FlowRenderMode.hover);
                }
            }
        }
        mousemove(event);
    };

    board.mouseleave = (event: MouseEvent) => {
        hoveredElement = null;
        relationEdges = null;
        mouseleave(event);
    };

    return board;
};
