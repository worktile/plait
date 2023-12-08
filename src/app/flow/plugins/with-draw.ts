import { PlaitBoard, PlaitOptionsBoard, PlaitPlugin, PlaitPluginElementContext } from '@plait/core';
import { FlowElement, FlowNode, PlaitFlowBoard, FlowPluginOptions, FlowPluginKey } from '@plait/flow';
import { CustomFlowNodeComponent } from '../custom-node.component';
import { IconComponent } from '../icon.component';
import { WorkflowType } from '../flow-data';

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

    newBoard.drawLabelIcon = () => {
        return IconComponent;
    };

    (board as PlaitOptionsBoard).setPluginOptions<FlowPluginOptions>(FlowPluginKey.flowOptions, {
        edgeLabelOptions: { height: 24, maxWidth: 100 }
    });

    return board;
};
