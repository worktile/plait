import {
    ELEMENT_TO_PLUGIN_COMPONENT,
    PlaitBoard,
    PlaitPlugin,
    PlaitPluginElementContext,
    RectangleClient,
    getMovingElements,
    isSelectedElement,
    normalizePoint
} from '@plait/core';
import { FlowNodeComponent } from '../flow-node.component';
import { FlowEdgeComponent } from '../flow-edge.component';
import { isHitFlowEdge } from '../utils/edge/is-hit-edge-element';
import { FlowElement } from '../interfaces/element';
import { FlowEdge } from '../interfaces/edge';
import { FlowNode } from '../interfaces/node';
import { withFlowEdgeDnd } from './with-edge-dnd';
import { getEdgesByNodeId } from '../utils/edge/get-edges-by-node';
import { OUTLINE_BUFFR } from '../constants/node';

export const withFlow: PlaitPlugin = (board: PlaitBoard) => {
    const { drawElement, isIntersectionSelection, isMovable, onChange } = board;

    board.drawElement = (context: PlaitPluginElementContext) => {
        if (FlowElement.isFlowElement(context.element)) {
            if (FlowEdge.isFlowEdgeElement(context.element)) {
                return FlowEdgeComponent;
            }
            return FlowNodeComponent;
        }
        return drawElement(context);
    };

    board.isIntersectionSelection = (element, range) => {
        const elementComponent = ELEMENT_TO_PLUGIN_COMPONENT.get(element) as FlowNodeComponent | FlowEdgeComponent;
        if (FlowElement.isFlowElement(element) && elementComponent && board.selection) {
            if (FlowNode.isFlowNodeElement(element)) {
                const { x, y } = normalizePoint(element.points![0]);
                const isSelected = isSelectedElement(board, element);
                const isIntersectNode = RectangleClient.isIntersect(RectangleClient.toRectangleClient([range.anchor, range.focus]), {
                    x: isSelected ? x : x + OUTLINE_BUFFR,
                    y: isSelected ? y : y + OUTLINE_BUFFR,
                    width: isSelected ? element.width : element.width - OUTLINE_BUFFR * 2,
                    height: isSelected ? element.height : element.height - OUTLINE_BUFFR * 2
                });
                return isIntersectNode;
            }
            if (FlowEdge.isFlowEdgeElement(element)) {
                return isHitFlowEdge(board, element, range.focus);
            }
        }
        return isIntersectionSelection(element, range);
    };

    board.isMovable = element => {
        if (FlowNode.isFlowNodeElement(element)) {
            return true;
        }
        return isMovable(element);
    };

    board.onChange = () => {
        onChange();
        const movingNodes = getMovingElements(board);
        if (movingNodes?.length) {
            const moveElement = movingNodes[0];
            if (FlowNode.isFlowNodeElement(moveElement)) {
                const relationEdges = getEdgesByNodeId(board, moveElement.id);
                relationEdges.map(item => {
                    const flowEdgeComponent = ELEMENT_TO_PLUGIN_COMPONENT.get(item) as FlowEdgeComponent;
                    flowEdgeComponent.drawElement();
                });
            }
        }
    };

    return withFlowEdgeDnd(board);
};
