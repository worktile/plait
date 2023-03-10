import { PlaitBoard, PlaitPlugin, PlaitPluginElementContext } from '@plait/core';
import { isFlowElement, isFlowEdgeElement } from '../interfaces';
import { FlowNodeComponent } from '../flow-node.component';
import { FlowEdgeComponent } from '../flow-edge.component';

export const withFlow: PlaitPlugin = (board: PlaitBoard) => {
    const { drawElement } = board;

    board.drawElement = (context: PlaitPluginElementContext) => {
        if (isFlowElement(context.element)) {
            if (isFlowEdgeElement(context.element)) {
                return FlowEdgeComponent;
            }
            return FlowNodeComponent;
        }
        return drawElement(context);
    };
    return board;
};
