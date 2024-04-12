import { PlaitBoard } from '@plait/core';
import { getOneMoveOptions, moveElementsToNewPath } from '../utils';

export const moveToTop = () => {};

export const moveToBottom = () => {};

export const moveUp = (board: PlaitBoard) => {
    const moveOptions = getOneMoveOptions(board, 'up');
    moveElementsToNewPath(board, moveOptions);
};

export const moveDown = (board: PlaitBoard) => {
    const moveOptions = getOneMoveOptions(board, 'down');
    moveElementsToNewPath(board, moveOptions);
};

export const ZIndexTransforms = { moveUp, moveDown, moveToTop, moveToBottom };
