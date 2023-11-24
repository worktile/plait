import { SetSelectionOperation } from '../interfaces/operation';
import { PlaitBoard } from '../interfaces/board';
import { Selection } from '../interfaces/selection';
import { BOARD_TO_TEMPORARY_ELEMENTS } from '../utils/weak-maps';
import { PlaitElement } from '../interfaces/element';
import { getTemporaryRef } from '../plugins/with-selection';

export function setSelection(board: PlaitBoard, selection: Selection | null) {
    const operation: SetSelectionOperation = { type: 'set_selection', properties: board.selection, newProperties: selection };
    board.apply(operation);
}

export interface SelectionTransforms {
    setSelection: (board: PlaitBoard, selection: Selection | null) => void;
    addSelectionWithTemporaryElements: (board: PlaitBoard, elements: PlaitElement[]) => void;
}

export const SelectionTransforms: SelectionTransforms = {
    setSelection,
    addSelectionWithTemporaryElements
};

export function addSelectionWithTemporaryElements(board: PlaitBoard, elements: PlaitElement[]) {
    const timeoutId = setTimeout(() => {
        setSelection(board, { anchor: [0, 0], focus: [0, 0] });
    }, 0);
    let ref = getTemporaryRef(board);
    if (ref) {
        clearTimeout(ref.timeoutId);
        const currentElements = ref.elements;
        ref.elements.push(...elements.filter(element => !currentElements.includes(element)));
        ref.timeoutId = timeoutId;
    } else {
        BOARD_TO_TEMPORARY_ELEMENTS.set(board, { timeoutId, elements });
    }
}
