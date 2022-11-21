import { isWorkflowTransition, WorkflowElement } from '../interfaces';
import { PlaitBoard } from '@plait/core';

export const getTranstionsByNode = (board: PlaitBoard, node: WorkflowElement) => {
    const transtions = (board.children as WorkflowElement[]).filter(item => {
        if (isWorkflowTransition(item)) {
            const fromIds = item.from?.length && item.from.map(from => from.id);
            return item.to?.id === node.id || (fromIds && fromIds.includes(node.id));
        }
        return false;
    });
    return transtions;
};
