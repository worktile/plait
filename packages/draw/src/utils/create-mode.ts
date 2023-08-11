import { PlaitBoard } from '@plait/core';

export enum DrawCreateMode {
    'drag' = 'drag',
    'draw' = 'draw'
}

const BOARD_TO_CREATE_MODE: WeakMap<PlaitBoard, DrawCreateMode> = new WeakMap();

export const getCreateMode = (board: PlaitBoard) => {
    return BOARD_TO_CREATE_MODE.get(board);
};

export const setCreateMode = (board: PlaitBoard, mode: DrawCreateMode) => {
    BOARD_TO_CREATE_MODE.set(board, mode);
};
