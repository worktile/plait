import { PlaitBoard } from '@plait/core';

export enum BoardCreationMode {
    'dnd' = 'dnd',
    'draw' = 'draw'
}

const BOARD_TO_CREATION_MODE: WeakMap<PlaitBoard, BoardCreationMode> = new WeakMap();

export const getCreationMode = (board: PlaitBoard) => {
    return BOARD_TO_CREATION_MODE.get(board);
};

export const setCreationMode = (board: PlaitBoard, mode: BoardCreationMode) => {
    BOARD_TO_CREATION_MODE.set(board, mode);
};

export const isDndMode = (board: PlaitBoard) => {
    return getCreationMode(board) === BoardCreationMode.dnd;
};

export const isDrawingMode = (board: PlaitBoard) => {
    return getCreationMode(board) === BoardCreationMode.draw;
};
