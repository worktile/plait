import { PlaitBoard, setDragging } from '@plait/core';
import { RotateRef } from '../types';

export const IS_ROTATING = new WeakMap<PlaitBoard, RotateRef>();

export const isRotating = (board: PlaitBoard) => {
    return !!IS_ROTATING.get(board);
};

export const addRotating = (board: PlaitBoard, rotateRef: RotateRef) => {
    PlaitBoard.getBoardContainer(board).classList.add(`draw-elements-rotating`);
    IS_ROTATING.set(board, rotateRef);
    setDragging(board, true);
};

export const removeRotating = (board: PlaitBoard) => {
    PlaitBoard.getBoardContainer(board).classList.remove(`draw-elements-rotating`);
    IS_ROTATING.delete(board);
    setDragging(board, false);
};
