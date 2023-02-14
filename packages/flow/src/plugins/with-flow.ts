import { PlaitBoard, PlaitElementContext, PlaitPlugin } from '@plait/core';
import { isFlowElement, isFlowEdgeElement } from '../interfaces';
import { FlowNodeComponent } from '../flow-node.component';
import { FlowEdgeComponent } from '../flow-edge.component';

export const withFlow: PlaitPlugin = (board: PlaitBoard) => {
    const { drawElement } = board;

    board.drawElement = (context: PlaitElementContext) => {
        const { element, selection, viewContainerRef, host } = context.elementInstance;
        if (isFlowElement(element)) {
            const flowComponentRef = isFlowEdgeElement(element)
                ? viewContainerRef.createComponent(FlowEdgeComponent)
                : viewContainerRef.createComponent(FlowNodeComponent);
            const flowInstance = flowComponentRef.instance;
            flowInstance.node = element;
            flowInstance.selection = selection;
            flowInstance.host = host;
            flowInstance.board = board;
            return [flowInstance.flowGGroup];
        }
        return drawElement(context);
    };

    return board;
};
