import { PlaitBoard } from '@plait/core';
import { getOneMoveOptions, moveElementsToNewPath, getAllZIndexMoveOptions } from '../utils';

const moveToTop = (board: PlaitBoard) => {
    const moveOptions = getAllZIndexMoveOptions(board, 'up');
    moveElementsToNewPath(board, moveOptions);
};

const moveToBottom = (board: PlaitBoard) => {
    const moveOptions = getAllZIndexMoveOptions(board, 'down');
    moveElementsToNewPath(board, moveOptions);
};


const moveUp = (board: PlaitBoard) => {
    const moveOptions = getOneMoveOptions(board, 'up');
    moveElementsToNewPath(board, moveOptions);
};

const moveDown = (board: PlaitBoard) => {
    const moveOptions = getOneMoveOptions(board, 'down');
    moveElementsToNewPath(board, moveOptions);
};

export const ZIndexTransforms = { moveUp, moveDown, moveToTop, moveToBottom };
