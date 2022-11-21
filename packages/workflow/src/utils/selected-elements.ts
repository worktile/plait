import { PlaitBoard, PLAIT_BOARD_TO_COMPONENT } from '@plait/core';
import { WorkflowElement } from '../interfaces';
import { WORKFLOW_ACTIVE_ELEMENT } from '../plugins/weak-maps';

// export function coerceArray<T>(value: T | T[]): T[] {
//     return Array.isArray(value) ? value : [value];
// }

// export function clearAllSelectedWorkflowElements(board: PlaitBoard) {
//     let selectedElements = getSelectedWorkflowElements(board);
//     deleteSelectedWorkflowElements(board, selectedElements);
//     WORKFLOW_ACTIVE_ELEMENT.delete(board);
// }

export function setSelectedWorkflowElement(board: PlaitBoard, element: WorkflowElement) {
    WORKFLOW_ACTIVE_ELEMENT.set(board, element!);
}

export function hasSelectedWorkflowElement(board: PlaitBoard, element: WorkflowElement) {
    let selectedElement = getSelectedWorkflowElement(board);
    return selectedElement && selectedElement!.id === element.id;
}

export function deleteSelectedWorkflowElement(board: PlaitBoard) {
    if (!getSelectedWorkflowElement(board)) {
        return;
    }
    WORKFLOW_ACTIVE_ELEMENT.delete(board);
}

export function getSelectedWorkflowElement(board: PlaitBoard) {
    return WORKFLOW_ACTIVE_ELEMENT.get(board);
}
