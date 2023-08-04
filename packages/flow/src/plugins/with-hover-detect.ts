import { PlaitBoard, PlaitPlugin, getSelectedElements, toPoint, transformPoint } from '@plait/core';
import { FlowEdge, FlowNode, getEdgesByNodeId, getHitEdge, getHitNode } from '../public-api';
import { addEdgeHovered, removeEdgeHovered } from '../utils/edge/hover-edge';
import { addNodeActive, removeNodeActive } from '../utils/node/active-node';

export const withHoverDetect: PlaitPlugin = (board: PlaitBoard) => {
    const { mousemove, mouseleave } = board;

    let hoveredElement: FlowNode | FlowEdge | null;
    let relationEdges: FlowEdge[] | null;

    board.mousemove = (event: MouseEvent) => {
        event.preventDefault();
        const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
        const newHitNode = getHitNode(board, point) || getHitEdge(board, point);
        const activeElement = getSelectedElements(board) && getSelectedElements(board)[0];

        if (hoveredElement) {
            if (newHitNode?.id === hoveredElement.id) {
                return;
            }
            if (FlowNode.isFlowNodeElement(hoveredElement)) {
                hoveredElement.id !== activeElement?.id && removeNodeActive(hoveredElement);
                (relationEdges || []).forEach(item => {
                    item.id !== activeElement?.id && removeEdgeHovered(item);
                });
            } else {
                hoveredElement.id !== activeElement?.id && removeEdgeHovered(hoveredElement);
            }
        }
        hoveredElement = newHitNode;
        if (hoveredElement) {
            if (FlowNode.isFlowNodeElement(hoveredElement)) {
                relationEdges = getEdgesByNodeId(board, hoveredElement.id);
                (relationEdges || []).forEach(item => {
                    item.id !== activeElement?.id && addEdgeHovered(item);
                });
                hoveredElement.id !== activeElement?.id && addNodeActive(hoveredElement, false);
            } else {
                hoveredElement.id !== activeElement?.id && addEdgeHovered(hoveredElement);
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
