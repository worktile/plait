import { PlaitBoard, PlaitElement } from '../interfaces';
import { setDragging } from './dnd';
import { BOARD_TO_MOVING_ELEMENT } from './weak-maps';

export const getMovingElements = (board: PlaitBoard) => {
    return BOARD_TO_MOVING_ELEMENT.get(board) || [];
};

export const isMovingElements = (board: PlaitBoard) => {
    return (BOARD_TO_MOVING_ELEMENT.get(board) || []).length > 0;
};

export const addMovingElements = (board: PlaitBoard, elements: PlaitElement[]) => {
    const movingElements = getMovingElements(board);
    const newElements = elements.filter(item => !movingElements.find(movingElement => movingElement.key === item.key));
    cacheMovingElements(board, [...movingElements, ...newElements]);
    setDragging(board, true);
};

export const removeMovingElements = (board: PlaitBoard) => {
    BOARD_TO_MOVING_ELEMENT.delete(board);
    setDragging(board, false);
};

export const cacheMovingElements = (board: PlaitBoard, elements: PlaitElement[]) => {
    BOARD_TO_MOVING_ELEMENT.set(board, elements);
};
