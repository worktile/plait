import { PlaitBoard, PlaitPlugin, PlaitPluginElementContext } from '@plait/core';
import { FlowElement, FlowNode } from '@plait/flow';
import { WorkflowType } from '../flow-data';
import { CustomFlowNodeComponent } from '../custom-node.component';

export const withDraw: PlaitPlugin = (board: PlaitBoard) => {
    const { drawElement } = board;

    board.drawElement = (context: PlaitPluginElementContext) => {
        if (FlowElement.isFlowElement(context.element)) {
            if (FlowNode.isFlowNodeElement<WorkflowType>(context.element) && context.element.data?.initialState) {
                return CustomFlowNodeComponent;
            }
        }
        return drawElement(context);
    };

    return board;
};
