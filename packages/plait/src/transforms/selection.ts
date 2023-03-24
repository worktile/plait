import { SetSelectionOperation } from '../interfaces/operation';
import { PlaitBoard } from '../interfaces/board';
import { Selection } from '../interfaces/selection';
import { BOARD_TO_TEMPORARY_ELEMENTS } from '../utils/weak-maps';
import { PlaitElement } from '../interfaces/element';

export function setSelection(board: PlaitBoard, selection: Selection | null) {
    const operation: SetSelectionOperation = { type: 'set_selection', properties: board.selection, newProperties: selection };
    board.apply(operation);
}

export interface SelectionTransforms {
    setSelection: (board: PlaitBoard, selection: Selection | null) => void;
    setSelectionWithTemporaryElements: (board: PlaitBoard, elements: PlaitElement[]) => void;
}

export const SelectionTransforms: SelectionTransforms = {
    setSelection,
    setSelectionWithTemporaryElements
};


export function setSelectionWithTemporaryElements(board: PlaitBoard, elements: PlaitElement[]) {
    setTimeout(() => {
        BOARD_TO_TEMPORARY_ELEMENTS.set(board, elements);
        setSelection(board, { ranges: [] });
    });
}