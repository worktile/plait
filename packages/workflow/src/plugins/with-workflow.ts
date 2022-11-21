import { SimpleChanges } from '@angular/core';
import { isNoSelectionElement, PlaitBoard, PlaitElementContext, PlaitPlugin, toPoint, transformPoint } from '@plait/core';
import { isWorkflowNode, isWorkflowOrigin, isWorkflowTransition, WorkflowElement } from '../interfaces';
import { WorkflowNodeComponent } from '../node.component';
import { WorkflowTransitionComponent } from '../transition.component';
import { hitWorkflowNode, hitWorkflowPortNode, hitWorkflowTranstion } from '../utils';
import { deleteSelectedWorkflowElement, hasSelectedWorkflowElement, setSelectedWorkflowElement } from '../utils/selected-elements';
import { WorkflowBaseComponent } from '../workflow-base.component';
import { WORKFLOW_ACTIVE_ELEMENT, WORKFLOW_ELEMENT_TO_COMPONENT } from './weak-maps';
import { withNodeDnd } from './with-dnd';

export const withWorkflow: PlaitPlugin = (board: PlaitBoard) => {
    const { drawElement, mousedown, globalMouseup } = board;

    board.drawElement = (context: PlaitElementContext) => {
        const { element, selection, viewContainerRef, host, rootG } = context.elementInstance;
        if (isWorkflowNode(element) || isWorkflowOrigin(element) || isWorkflowTransition(element)) {
            const workflowComponentRef = !isWorkflowTransition(element)
                ? viewContainerRef.createComponent(WorkflowNodeComponent)
                : viewContainerRef.createComponent(WorkflowTransitionComponent);
            const workflowInstance = workflowComponentRef.instance;
            workflowInstance.node = element;
            workflowInstance.selection = selection;
            workflowInstance.host = host;
            workflowInstance.board = board;
            workflowInstance.rootGroup = rootG;
            return [workflowInstance.workflowGGroup];
        }
        return drawElement(context);
    };

    board.redrawElement = (context: PlaitElementContext, changes: SimpleChanges) => {
        const { element, selection } = context.elementInstance;
        const elementChange = changes['element'];
        if (isWorkflowNode(element) || isWorkflowOrigin(element) || isWorkflowTransition(element)) {
            const previousElement = (elementChange && elementChange.previousValue) || element;
            const workflowInstance = WORKFLOW_ELEMENT_TO_COMPONENT.get(previousElement);
            if (!workflowInstance) {
                throw new Error('undefined workflow component');
            }
            workflowInstance.node = element;
            workflowInstance.selection = selection;
            if (elementChange) {
                workflowInstance.updateWorkflow();
            } else {
                workflowInstance.doCheck();
            }
            return [workflowInstance.workflowGGroup];
        }
        return drawElement(context);
    };

    board.mousedown = (event: MouseEvent) => {
        const point = transformPoint(board, toPoint(event.x, event.y, board.host));

        (board.children as WorkflowElement[]).forEach((value: WorkflowElement) => {
            if (
                (isWorkflowNode(value) && hitWorkflowNode(point, value)) ||
                (isWorkflowTransition(value) && hitWorkflowTranstion(event, value))
            ) {
                setSelectedWorkflowElement(board, value);
            } else {
                hasSelectedWorkflowElement(board, value) && deleteSelectedWorkflowElement(board);
            }
        });
        mousedown(event);
    };

    board.globalMouseup = (event: MouseEvent) => {
        const isBoardInside = event.target instanceof Node && board.host.contains(event.target);
        // const isFakeNode = event.target instanceof HTMLElement && event.target.closest('.fake-node');
        const noSelectionElement = isNoSelectionElement(event);
        if (!isBoardInside && !noSelectionElement) {
            const hasSelectedElement = WORKFLOW_ACTIVE_ELEMENT.has(board);
            if (hasSelectedElement) {
                WORKFLOW_ACTIVE_ELEMENT.set(board, null);
            }
        }
        globalMouseup(event);
    };

    return withNodeDnd(board);
};
