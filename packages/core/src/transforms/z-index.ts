import { PlaitBoard } from '../interfaces';
import { moveElementsToNewPath } from '../utils';
import { getAllMoveOptions, getOneMoveOptions } from '../utils/z-index';

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

export interface ZIndexTransforms {
    moveUp: (board: PlaitBoard) => void;
    moveDown: (board: PlaitBoard) => void;
    moveToTop: (board: PlaitBoard) => void;
    moveToBottom: (board: PlaitBoard) => void;
}

export const ZIndexTransforms = { moveUp, moveDown, moveToTop, moveToBottom };
