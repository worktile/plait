import {
    ELEMENT_TO_PLUGIN_COMPONENT,
    PlaitBoard,
    PlaitPlugin,
    PlaitPluginElementContext,
    RectangleClient,
    normalizePoint
} from '@plait/core';
import { FlowNodeComponent } from '../flow-node.component';
import { FlowEdgeComponent } from '../flow-edge.component';
import { isHitFlowEdge } from '../utils/edge/is-hit-edge-element';
import { FlowElement } from '../interfaces/element';
import { FlowEdge } from '../interfaces/edge';
import { FlowNode } from '../interfaces/node';
import { withFlowEdgeDnd } from './with-edge-dnd';

export const withFlow: PlaitPlugin = (board: PlaitBoard) => {
    const { drawElement, isIntersectionSelection } = board;

    board.drawElement = (context: PlaitPluginElementContext) => {
        if (FlowElement.isFlowElement(context.element)) {
            if (FlowEdge.isFlowEdgeElement(context.element)) {
                return FlowEdgeComponent;
            }
            return FlowNodeComponent;
        }
        return drawElement(context);
    };

    board.isIntersectionSelection = element => {
        const elementComponent = ELEMENT_TO_PLUGIN_COMPONENT.get(element) as FlowNodeComponent | FlowEdgeComponent;
        if (FlowElement.isFlowElement(element) && elementComponent && board.selection) {
            if (FlowNode.isFlowNodeElement(element)) {
                const { x, y } = normalizePoint(element.points![0]);
                return RectangleClient.isIntersect(RectangleClient.toRectangleClient([board.selection!.anchor, board.selection!.focus]), {
                    x,
                    y,
                    width: element.width,
                    height: element.height
                });
            }
            if (FlowEdge.isFlowEdgeElement(element)) {
                return isHitFlowEdge(board, element, board.selection.focus);
            }
        }
        return isIntersectionSelection(element);
    };

    return withFlowEdgeDnd(board);
};
