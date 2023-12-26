import { PlaitBoard } from "../interfaces/board";

export const IS_DRAGGING = new WeakMap<PlaitBoard, boolean>();


export const isDragging = (board: PlaitBoard) => {
    return !!IS_DRAGGING.get(board);
};

export const setDragging = (board: PlaitBoard, state: boolean) => {
    IS_DRAGGING.set(board, state);
}