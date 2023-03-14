import { ELEMENT_TO_PLUGIN_COMPONENT, PlaitBoard, PlaitPlugin, PlaitPluginElementContext, RectangleClient } from '@plait/core';
import { FlowEdge, FlowElement, FlowNode } from '../interfaces';
import { FlowNodeComponent } from '../flow-node.component';
import { FlowEdgeComponent } from '../flow-edge.component';
import { getClientByNode } from '../queries/get-client-by-node';
import { isHitFlowEdge } from '../queries/is-hit-flow-element';

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
        const nodeComponent = ELEMENT_TO_PLUGIN_COMPONENT.get(element) as FlowNodeComponent | FlowEdgeComponent;
        if (FlowElement.isFlowElement(element) && nodeComponent && board.selection) {
            if (FlowNode.isFlowNodeElement(element)) {
                const client = getClientByNode(element);
                return RectangleClient.isIntersect(
                    RectangleClient.toRectangleClient([board.selection!.anchor, board.selection!.focus]),
                    client
                );
            }
            if (FlowEdge.isFlowEdgeElement(element)) {
                return isHitFlowEdge(element, board);
            }
        }
        return isIntersectionSelection(element);
    };

    return board;
};
