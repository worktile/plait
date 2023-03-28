import { PlaitBoard, PlaitElement } from '../interfaces';
import { BOARD_TO_MOVING_ELEMENT } from './weak-maps';

export const getMovingElements = (board: PlaitBoard) => {
    return BOARD_TO_MOVING_ELEMENT.get(board) || [];
};

export const addMovingElements = (board: PlaitBoard, elements: PlaitElement[]) => {
    const movingElements = getMovingElements(board);
    cacheMovingElements(board, [...movingElements, ...elements]);
};

export const removeMovingElements = (board: PlaitBoard) => {
    BOARD_TO_MOVING_ELEMENT.delete(board);
};

export const cacheMovingElements = (board: PlaitBoard, elements: PlaitElement[]) => {
    BOARD_TO_MOVING_ELEMENT.set(board, elements);
};
