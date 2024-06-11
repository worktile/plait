import { PlaitBoard, getSelectedElements, PlaitElement } from '@plait/core';
import { PlaitTableElement, PlaitTableCell, PlaitBaseTable, PlaitTable } from '../interfaces/table';
import { PlaitDrawElement } from '../interfaces';

export const isSingleSelectTable = (board: PlaitBoard) => {
    const selectedElements = getSelectedElements(board);
    return selectedElements && selectedElements.length === 1 && PlaitTableElement.isTable(selectedElements[0]);
};

export const isSingleSelectElementByTable = (board: PlaitBoard) => {
    const selectedElements = getSelectedElements(board);
    return selectedElements && selectedElements.length === 1 && PlaitDrawElement.isElementByTable(selectedElements[0]);
};

export const getSelectedTableElements = (board: PlaitBoard, elements?: PlaitElement[]) => {
    const selectedElements = elements?.length ? elements : getSelectedElements(board);
    return selectedElements.filter(value => PlaitTableElement.isTable(value)) as PlaitTable[];
};

export const SELECTED_CELLS = new WeakMap<PlaitBaseTable, PlaitTableCell[]>();

export function getSelectedCells(element: PlaitBaseTable) {
    return SELECTED_CELLS.get(element);
}

export function setSelectedCells(element: PlaitBaseTable, cells: PlaitTableCell[]) {
    return SELECTED_CELLS.set(element, cells);
}

export function clearSelectedCells(element: PlaitBaseTable) {
    return SELECTED_CELLS.delete(element);
}
