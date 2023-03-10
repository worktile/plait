import {
    ELEMENT_TO_PLUGIN_COMPONENT,
    PlaitBoard,
    PlaitElement,
    PlaitPlugin,
    PlaitPluginElementContext,
    isNoSelectionElement,
    toPoint,
    transformPoint
} from '@plait/core';
import { isFlowElement, isFlowEdgeElement, isFlowNodeElement } from '../interfaces';
import { FlowNodeComponent } from '../flow-node.component';
import { FlowEdgeComponent } from '../flow-edge.component';
import { addSelectedElements, clearAllSelectedElements, deleteSelectedElements, hasSelectedElements } from '../utils/selected-elements';
import { SELECTED_FlOW_ELEMENTS } from './weak-maps';
import { withFloweDnd } from './with-dnd';
import { isHitFlowNode } from '../queries/is-hit-flow-node';

export const withFlow: PlaitPlugin = (board: PlaitBoard) => {
    const { drawElement, mousedown, globalMouseup } = board;

    board.drawElement = (context: PlaitPluginElementContext) => {
        if (isFlowElement(context.element)) {
            if (isFlowEdgeElement(context.element)) {
                return FlowEdgeComponent;
            }
            return FlowNodeComponent;
        }
        return drawElement(context);
    };

    board.mousedown = (event: MouseEvent) => {
        const point = transformPoint(board, toPoint(event.x, event.y, board.host));
        board.children.forEach((value: PlaitElement) => {
            if (isFlowElement(value)) {
                const flowNodeComponent = ELEMENT_TO_PLUGIN_COMPONENT.get(value) as FlowNodeComponent;
                const hitFlowNode = isHitFlowNode(event, board, point, flowNodeComponent.element);
                if (hitFlowNode) {
                    addSelectedElements(board, value);
                } else {
                    hasSelectedElements(board, value) && deleteSelectedElements(board, value);
                }
            }
        });
        mousedown(event);
    };

    board.globalMouseup = (event: MouseEvent) => {
        const isBoardInside = event.target instanceof Node && board.host.contains(event.target);
        const isFakeNode = event.target instanceof HTMLElement && event.target.closest('.fake-node');
        const noSelectionElement = isNoSelectionElement(event);
        if (!isBoardInside && !noSelectionElement && !isFakeNode) {
            const hasSelectedElement = SELECTED_FlOW_ELEMENTS.has(board);
            if (hasSelectedElement) {
                clearAllSelectedElements(board);
            }
        }
        globalMouseup(event);
    };
    return withFloweDnd(board);
};
