import { PlaitBoard } from '@plait/core';
import { getOneMoveOptions, moveElementsToNewPath } from '../utils';

const moveToTop = () => {};

const moveToBottom = () => {};

const moveUp = (board: PlaitBoard) => {
    const moveOptions = getOneMoveOptions(board, 'up');
    moveElementsToNewPath(board, moveOptions);
};

const moveDown = (board: PlaitBoard) => {
    const moveOptions = getOneMoveOptions(board, 'down');
    moveElementsToNewPath(board, moveOptions);
};

export const ZIndexTransforms = { moveUp, moveDown, moveToTop, moveToBottom };
