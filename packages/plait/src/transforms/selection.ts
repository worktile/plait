import { SetSelectionOperation } from '../interfaces/operation';
import { PlaitBoard } from '../interfaces/board';
import { Range } from '../interfaces/selection';

export function setSelection(board: PlaitBoard, selection: Range | null) {
    const operation: SetSelectionOperation = { type: 'set_selection', properties: board.selection, newProperties: selection };
    board.apply(operation);
}

export interface SelectionTransforms {
    setSelection: (board: PlaitBoard, selection: Range | null) => void;
}

export const SelectionTransforms: SelectionTransforms = {
    setSelection
};
