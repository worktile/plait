import { PlaitBoard, PlaitPlugin, PlaitPluginElementContext } from '@plait/core';
import { FlowElement, FlowNode, PlaitFlowBoard } from '@plait/flow';
import { WorkflowType } from '../flow-data';
import { CustomFlowNodeComponent } from '../custom-node.component';
import { IconComponent } from '../icon.component';

export const withDraw: PlaitPlugin = (board: PlaitBoard) => {
    const newBoard = board as PlaitBoard & PlaitFlowBoard;

    const { drawElement } = board;

    newBoard.drawElement = (context: PlaitPluginElementContext) => {
        if (FlowElement.isFlowElement(context.element)) {
            if (FlowNode.isFlowNodeElement<WorkflowType>(context.element) && context.element.data?.initialState) {
                return CustomFlowNodeComponent;
            }
        }
        return drawElement(context);
    };

    newBoard.drawIcon = () => {
        return IconComponent;
    };

    return board;
};
