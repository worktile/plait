import { PlaitBoard, getSelectedElements, PlaitElement } from '@plait/core';
import { PlaitTableElement, PlaitTable, PlaitTableCell } from '../interfaces/table';

export const isSingleSelectTable = (board: PlaitBoard) => {
    const selectedElements = getSelectedElements(board);
    return selectedElements && selectedElements.length === 1 && PlaitTableElement.isTable(selectedElements[0]);
};

export const getSelectedTableElements = (board: PlaitBoard, elements?: PlaitElement[]) => {
    const selectedElements = elements?.length ? elements : getSelectedElements(board);
    return selectedElements.filter(value => PlaitTableElement.isTable(value)) as PlaitTable[];
};

export const SELECTED_CELLS = new WeakMap<PlaitTable, PlaitTableCell[]>();

export function getSelectedCells(element: PlaitTable) {
    return SELECTED_CELLS.get(element);
}

export function setSelectedCells(element: PlaitTable, cells: PlaitTableCell[]) {
    return SELECTED_CELLS.set(element, cells);
}

export function clearSelectedCells(element: PlaitTable) {
    return SELECTED_CELLS.delete(element);
}
