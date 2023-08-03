import { PlaitBoard, PlaitElement, PlaitPlugin, getSelectedElements, toPoint, transformPoint } from '@plait/core';
import { FlowEdge, FlowElement, FlowNode, getEdgesByNodeId, getHitNode, getHitNodeHandle } from '../public-api';
import { addEdgeHovered, removeEdgeHovered } from '../utils/edge/hover-edge';
import { addNodeActive, removeNodeActive } from '../utils/node/hover-node';

export const withNodeHover: PlaitPlugin = (board: PlaitBoard) => {
    const { mousemove, mouseup, mouseleave } = board;

    let activeElement: PlaitElement | null;
    let hoveredElement: FlowNode | null;
    let selectedNodeRelationEdges: FlowEdge[] | null;
    let hoverNodeRelationEdges: FlowEdge[] | null;

    board.mouseup = (event: MouseEvent) => {
        mouseup(event);
        // 选中 flowNode 相关 edge 高亮
        if (
            activeElement &&
            getSelectedElements(board)[0] !== activeElement &&
            FlowNode.isFlowNodeElement(getSelectedElements(board)[0] as FlowElement)
        ) {
            (selectedNodeRelationEdges || []).forEach(item => {
                removeEdgeHovered(item);
                activeElement = null;
                selectedNodeRelationEdges = null;
            });
            removeNodeActive(activeElement as FlowNode, false);
        }
        activeElement = getSelectedElements(board) && getSelectedElements(board)[0];
        if (activeElement && FlowNode.isFlowNodeElement(activeElement as FlowElement)) {
            selectedNodeRelationEdges = getEdgesByNodeId(board, activeElement.id);
            if (selectedNodeRelationEdges?.length) {
                selectedNodeRelationEdges.forEach(item => {
                    addEdgeHovered(item);
                });
            }
            addNodeActive(activeElement as FlowNode);
        }
    };

    board.mousemove = (event: MouseEvent) => {
        // 鼠标移入 flowNode 相关 edge 高亮
        event.preventDefault();
        const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
        const newHitNode = getHitNode(board, point);
        const activeElement = getSelectedElements(board) && getSelectedElements(board)[0];
        if (hoveredElement && FlowNode.isFlowNodeElement(hoveredElement)) {
            if (newHitNode === hoveredElement) {
                return;
            }
            const selectedNodeRelationEdgeIds: string[] = [];
            (selectedNodeRelationEdges || []).forEach(item => selectedNodeRelationEdgeIds.push(item.id));
            (hoverNodeRelationEdges || []).forEach(item => {
                if (!selectedNodeRelationEdgeIds.includes(item.id) && item.id !== activeElement?.id) {
                    removeEdgeHovered(item);
                }
            });
            if (!activeElement && FlowNode.isFlowNodeElement(hoveredElement)) {
                removeNodeActive(hoveredElement, false);
            }
        }

        hoveredElement = newHitNode;
        if (hoveredElement && FlowNode.isFlowNodeElement(hoveredElement)) {
            hoverNodeRelationEdges = getEdgesByNodeId(board, hoveredElement.id);
            [...hoverNodeRelationEdges, ...(selectedNodeRelationEdges || [])].forEach(item => {
                if (item.id !== activeElement?.id) {
                    addEdgeHovered(item);
                }
            });
            if (hoveredElement !== activeElement) {
                addNodeActive(hoveredElement, false);
            }
        }
        mousemove(event);
    };

    board.mouseleave = (event: MouseEvent) => {
        if (hoverNodeRelationEdges?.length && !getSelectedElements(board)[0]) {
            hoverNodeRelationEdges.forEach(item => {
                removeEdgeHovered(item);
            });
            hoveredElement = null;
            hoverNodeRelationEdges = null;
        }
        mouseleave(event);
    };

    return board;
};
