import { PlaitBoard } from "../interfaces/board";
import { PlaitPointerType } from "../interfaces/pointer";
import { PLAIT_BOARD_TO_COMPONENT } from "../utils";

export const updatePointerType = (board: PlaitBoard, pointer: PlaitPointerType) => {
    board.pointer = pointer;
    const boardComponent = PLAIT_BOARD_TO_COMPONENT.get(board);
    boardComponent?.markForCheck();
};

