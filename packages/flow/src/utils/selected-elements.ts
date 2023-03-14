import { PlaitBoard } from '@plait/core';
import { FlowElement } from '../interfaces';
import { SELECTED_FlOW_ELEMENTS } from '../plugins/weak-maps';

export function coerceArray<T>(value: T | T[]): T[] {
    return Array.isArray(value) ? value : [value];
}

export function addSelectedElements(board: PlaitBoard, elementOrElements: FlowElement | FlowElement[]) {
    if (hasSelectedElements(board, elementOrElements)) {
        deleteSelectedElements(board, elementOrElements);
    }
    let selectedElements = getSelectedElements(board);
    SELECTED_FlOW_ELEMENTS.set(board, [...selectedElements, ...coerceArray(elementOrElements)]);
}

export function hasSelectedElements(board: PlaitBoard, elementOrElements: FlowElement | FlowElement[]) {
    let selectedElements = getSelectedElements(board);
    const selectedElementIds = selectedElements.map(node => node && node.id);
    return coerceArray(elementOrElements).every(node => selectedElementIds?.includes(node.id));
}

export function getSelectedElements(board: PlaitBoard) {
    let selectedElements = SELECTED_FlOW_ELEMENTS.get(board);
    return selectedElements || [];
}

export function deleteSelectedElements(board: PlaitBoard, elementOrElements: FlowElement | FlowElement[]) {
    if (!hasSelectedElements(board, elementOrElements)) {
        return;
    }
    let selectedElements = getSelectedElements(board);
    const nodeIds = coerceArray(elementOrElements).map(node => node.id);
    selectedElements = selectedElements.filter(node => !nodeIds.includes(node.id));
    SELECTED_FlOW_ELEMENTS.set(board, selectedElements);
}

export function clearAllSelectedElements(board: PlaitBoard) {
    let selectedElements = getSelectedElements(board);
    deleteSelectedElements(board, selectedElements);
    SELECTED_FlOW_ELEMENTS.delete(board);
}
