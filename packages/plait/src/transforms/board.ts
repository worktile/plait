import { PlaitBoard } from '../interfaces/board';
import { PlaitPointerType } from '../interfaces/pointer';
import { BOARD_TO_COMPONENT } from '../utils';

export const updatePointerType = <T extends string = PlaitPointerType>(board: PlaitBoard, pointer: T) => {
    board.pointer = pointer;
    const boardComponent = BOARD_TO_COMPONENT.get(board);
    boardComponent?.markForCheck();
};

export const BoardTransforms = {
    updatePointerType
};
