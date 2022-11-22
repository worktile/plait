import { isWorkflowTransition, WorkflowElement } from '../interfaces';
import { PlaitBoard } from '@plait/core';

export const getTranstionsByNode = (board: PlaitBoard, node: WorkflowElement) => {
    const transtions = (board.children as WorkflowElement[]).filter(item => {
        if (isWorkflowTransition(item)) {
            return item.to?.id === node.id || item.from?.id === node.id;
        }
        return false;
    });
    return transtions;
};
