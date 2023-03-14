import { ELEMENT_TO_PLUGIN_COMPONENT, PlaitBoard, PlaitPlugin, PlaitPluginElementContext, RectangleClient } from '@plait/core';
import { isFlowElement, isFlowEdgeElement, isFlowNodeElement } from '../interfaces';
import { FlowNodeComponent } from '../flow-node.component';
import { FlowEdgeComponent } from '../flow-edge.component';
import { withFloweDnd } from './with-dnd';
import { isHitFlowEdge } from '../queries/is-hit-flow-element';
import { getClientByNode } from '../queries/get-client-by-node';
import { withFloweMove } from './with-move';

export const withFlow: PlaitPlugin = (board: PlaitBoard) => {
    const { drawElement, isIntersectionSelection } = board;

    board.drawElement = (context: PlaitPluginElementContext) => {
        if (isFlowElement(context.element)) {
            if (isFlowEdgeElement(context.element)) {
                return FlowEdgeComponent;
            }
            return FlowNodeComponent;
        }
        return drawElement(context);
    };

    board.isIntersectionSelection = element => {
        const nodeComponent = ELEMENT_TO_PLUGIN_COMPONENT.get(element) as FlowNodeComponent | FlowEdgeComponent;
        if (isFlowElement(element) && nodeComponent && board.selection) {
            if (isFlowNodeElement(element)) {
                const client = getClientByNode(element);
                return RectangleClient.isIntersect(
                    RectangleClient.toRectangleClient([board.selection!.anchor, board.selection!.focus]),
                    client
                );
            }
            if (isFlowEdgeElement(element)) {
                return isHitFlowEdge(element, [board.selection.anchor, board.selection.focus]);
            }
        }
        return isIntersectionSelection(element);
    };
    return withFloweMove(board);
};
