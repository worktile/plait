import { PlaitBoard, PlaitElementContext, PlaitPlugin } from '@plait/core';
import { isWorkflowNode, isWorkflowOrigin, isWorkflowTransition } from '../interfaces';
import { WorkflowNodeComponent } from '../node.component';
import { WorkflowTransitionComponent } from '../transition.component';

export const withWorkflow: PlaitPlugin = (board: PlaitBoard) => {
    const { drawElement } = board;

    board.drawElement = (context: PlaitElementContext) => {
        const { element, selection, viewContainerRef, host } = context.elementInstance;
        if (isWorkflowNode(element) || isWorkflowOrigin(element) || isWorkflowTransition(element)) {
            const workflowComponentRef = !isWorkflowTransition(element)
                ? viewContainerRef.createComponent(WorkflowNodeComponent)
                : viewContainerRef.createComponent(WorkflowTransitionComponent);
            const workflowInstance = workflowComponentRef.instance;
            workflowInstance.node = element;
            workflowInstance.selection = selection;
            workflowInstance.host = host;
            workflowInstance.board = board;
            return [workflowInstance.workflowGGroup];
        }
        return drawElement(context);
    };
    return board;
};
