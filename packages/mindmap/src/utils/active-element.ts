import { PlaitBoard } from '@plait/core';
import { MindmapElement } from '../interfaces';
import { coerceArray } from './util';
import { SELECTED_MINDMAP_ELEMENTS } from './weak-maps';

export function clearAllSelectedMindmapElements(board: PlaitBoard) {
    const selectedElements = SELECTED_MINDMAP_ELEMENTS.get(board) || [];
    deleteSelectedMindmapElements(board, selectedElements);
    SELECTED_MINDMAP_ELEMENTS.delete(board);
}

export function addSelectedMindmapElements(board: PlaitBoard, elementOrElements: MindmapElement | MindmapElement[]) {
    if (hasSelectedMindmapElement(board, elementOrElements)) {
        deleteSelectedMindmapElements(board, elementOrElements);
    }
    const selectedElements = SELECTED_MINDMAP_ELEMENTS.get(board);
    SELECTED_MINDMAP_ELEMENTS.set(board, [...(selectedElements || []), ...coerceArray(elementOrElements)]);
}

export function hasSelectedMindmapElement(board: PlaitBoard, elementOrElements: MindmapElement | MindmapElement[]) {
    const selectedElements = SELECTED_MINDMAP_ELEMENTS.get(board);
    const selectedElementIds = coerceArray(selectedElements).map(node => node && node.id);
    return coerceArray(elementOrElements).every(node => selectedElementIds?.includes(node.id));
}

export function deleteSelectedMindmapElements(board: PlaitBoard, elementOrElements: MindmapElement | MindmapElement[]) {
    if (!hasSelectedMindmapElement(board, elementOrElements)) {
        return;
    }
    let selectedElements = SELECTED_MINDMAP_ELEMENTS.get(board);
    const nodeIds = coerceArray(elementOrElements).map(node => node.id);
    selectedElements = selectedElements?.filter(node => !nodeIds.includes(node.id)) || [];
    SELECTED_MINDMAP_ELEMENTS.set(board, selectedElements);
}
