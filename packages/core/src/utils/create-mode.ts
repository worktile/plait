import { PlaitBoard } from '../interfaces';

export enum BoardCreateMode {
    'drag' = 'drag',
    'draw' = 'draw'
}

const BOARD_TO_CREATE_MODE: WeakMap<PlaitBoard, BoardCreateMode> = new WeakMap();

export const getCreateMode = (board: PlaitBoard) => {
    return BOARD_TO_CREATE_MODE.get(board);
};

export const setCreateMode = (board: PlaitBoard, mode: BoardCreateMode) => {
    BOARD_TO_CREATE_MODE.set(board, mode);
};
