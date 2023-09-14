import { PlaitBoard } from '@plait/core';

export enum BoardCreationMode {
    'dnd' = 'dnd',
    'drawing' = 'drawing'
}

const BOARD_TO_CREATE_MODE: WeakMap<PlaitBoard, BoardCreationMode> = new WeakMap();

export const getCreateMode = (board: PlaitBoard) => {
    return BOARD_TO_CREATE_MODE.get(board);
};

export const setCreateMode = (board: PlaitBoard, mode: BoardCreationMode) => {
    BOARD_TO_CREATE_MODE.set(board, mode);
};

export const isDndMode = (board: PlaitBoard) => {
    return getCreateMode(board) === BoardCreationMode.dnd;
};

export const isDrawingMode = (board: PlaitBoard) => {
    return getCreateMode(board) === BoardCreationMode.drawing;
};
