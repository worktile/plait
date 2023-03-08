import { PlaitBoard } from "../interfaces/board";
import { PlaitPointerType } from "../interfaces/pointer";
import { BOARD_TO_COMPONENT } from "../utils";

export const updatePointerType = (board: PlaitBoard, pointer: PlaitPointerType) => {
    board.pointer = pointer;
    const boardComponent = BOARD_TO_COMPONENT.get(board);
    boardComponent?.markForCheck();
};

