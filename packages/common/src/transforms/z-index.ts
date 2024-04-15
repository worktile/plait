import { moveElementsToNewPath, PlaitBoard } from '@plait/core';
import { getOneMoveOptions, getAllMoveOptions } from '../utils';

const moveToTop = (board: PlaitBoard) => {
    const moveOptions = getAllMoveOptions(board, 'up');
    moveElementsToNewPath(board, moveOptions);
};

const moveToBottom = (board: PlaitBoard) => {
    const moveOptions = getAllMoveOptions(board, 'down');
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
