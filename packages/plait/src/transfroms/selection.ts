import { SetSelectionOperation } from '../interfaces/operation';
import { PlaitBoard } from '../interfaces/board';
import { Selection } from '../interfaces/selection';

export function setSelection(board: PlaitBoard, selection: Selection | null) {
    const operation: SetSelectionOperation = { type: 'set_selection', properties: board.selection, newProperties: selection };
    board.apply(operation);
}

export interface SelectionTransforms {
    setSelection: (board: PlaitBoard, selection: Selection | null) => void;
}

export const SelectionTransforms: SelectionTransforms = {
    setSelection
};
