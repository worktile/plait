import {
    PlaitBoard,
    PlaitElement,
    PlaitPlugin,
    addSelectedElement,
    clearSelectedElement,
    getSelectedElements,
    toPoint,
    transformPoint
} from '@plait/core';
import { FlowNode } from '../interfaces/node';
import { FlowEdge } from '../interfaces/edge';
import { getEdgesByNodeId } from '../utils/edge/get-edges-by-node';
import { FlowElement } from '../interfaces/element';
import { FlowEdgeComponent } from '../flow-edge.component';
import { FlowRenderMode } from '../interfaces/flow';
import { getHitNode } from '../utils/node/get-hit-node';
import { getHitEdge } from '../utils/edge/get-hit-edge';
import { addRelationEdgeInfo, deleteRelationEdgeInfo } from '../utils/edge/relation-edge';

export const withEdgeHighlight: PlaitPlugin = (board: PlaitBoard) => {
    const { mousedown, mouseup } = board;

    let activeElement: PlaitElement | null;
    let relationEdges: FlowEdge[] | null;

    board.mousedown = event => {
        mousedown(event);
        const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
        const newHitNode = getHitNode(board, point) || getHitEdge(board, point);
        clearSelectedElement(board);
        addSelectedElement(board, newHitNode as PlaitElement);
    };

    board.mouseup = event => {
        mouseup(event);
        (relationEdges || []).forEach(item => {
            const component = PlaitElement.getComponent(item) as FlowEdgeComponent;
            component && component.drawElement(item, FlowRenderMode.default);
            deleteRelationEdgeInfo(item);
        });
        relationEdges = null;

        activeElement = getSelectedElements(board) && getSelectedElements(board)[0];
        if (activeElement && FlowNode.isFlowNodeElement(activeElement as FlowElement)) {
            relationEdges = getEdgesByNodeId(board, activeElement.id);
            (relationEdges || []).forEach(item => {
                addRelationEdgeInfo(item);
                const component = PlaitElement.getComponent(item) as FlowEdgeComponent;
                component && component.drawElement(item, FlowRenderMode.hover);
            });
        }
    };

    return board;
};
