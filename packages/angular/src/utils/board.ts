import { PlaitBoard, PlaitPointerType } from "@plait/core";
import { BOARD_TO_COMPONENT } from "./weak-maps";

const updatePointerType = <T extends string = PlaitPointerType>(board: PlaitBoard, pointer: T) => {
    if (board.pointer === pointer) return;
    board.pointer = pointer;
    const boardComponent = BOARD_TO_COMPONENT.get(board);
    boardComponent?.markForCheck();
};