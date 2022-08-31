import { PlaitBoard } from '@plait/core';
import { MindmapElement } from '../interfaces';
import { coerceArray } from './util';
import { SELECTED_MINDMAP_ELEMENTS } from './weak-maps';

export function clearAllSelectedMindmapElements(board: PlaitBoard) {
    let selectedElements = getSelectedMindmapElements(board);
    deleteSelectedMindmapElements(board, selectedElements);
    SELECTED_MINDMAP_ELEMENTS.delete(board);
}

export function addSelectedMindmapElements(board: PlaitBoard, elementOrElements: MindmapElement | MindmapElement[]) {
    if (hasSelectedMindmapElement(board, elementOrElements)) {
        deleteSelectedMindmapElements(board, elementOrElements);
    }
    let selectedElements = getSelectedMindmapElements(board);
    SELECTED_MINDMAP_ELEMENTS.set(board, [...selectedElements, ...coerceArray(elementOrElements)]);
}

export function hasSelectedMindmapElement(board: PlaitBoard, elementOrElements: MindmapElement | MindmapElement[]) {
    let selectedElements = getSelectedMindmapElements(board);
    const selectedElementIds = selectedElements.map(node => node && node.id);
    return coerceArray(elementOrElements).every(node => selectedElementIds?.includes(node.id));
}

export function deleteSelectedMindmapElements(board: PlaitBoard, elementOrElements: MindmapElement | MindmapElement[]) {
    if (!hasSelectedMindmapElement(board, elementOrElements)) {
        return;
    }
    let selectedElements = getSelectedMindmapElements(board);
    const nodeIds = coerceArray(elementOrElements).map(node => node.id);
    selectedElements = selectedElements.filter(node => !nodeIds.includes(node.id));
    SELECTED_MINDMAP_ELEMENTS.set(board, selectedElements);
}

export function getSelectedMindmapElements(board: PlaitBoard) {
    let selectedElements = SELECTED_MINDMAP_ELEMENTS.get(board);
    return selectedElements || [];
}
