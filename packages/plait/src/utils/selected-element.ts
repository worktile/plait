import { PlaitBoard } from '../interfaces/board';
import { PlaitElement } from '../interfaces/element';
import { PlaitNode } from '../interfaces/node';
import { depthFirstRecursion } from './tree';
import { BOARD_TO_SELECTED_ELEMENT } from './weak-maps';

export const calcElementIntersectionSelection = (board: PlaitBoard) => {
    const selectedElements: PlaitElement[] = [];
    depthFirstRecursion<PlaitNode>(board, node => {
        if (
            PlaitElement.isElement(node) &&
            board.selection?.ranges.some(range => {
                return board.isIntersectionSelection(node, range);
            })
        ) {
            selectedElements.push(node);
        }
    });
    return selectedElements;
};

export const cacheSelectedElements = (board: PlaitBoard, selectedElements: PlaitElement[]) => {
    BOARD_TO_SELECTED_ELEMENT.set(board, selectedElements);
};

export const getSelectedElements = (board: PlaitBoard) => {
    return BOARD_TO_SELECTED_ELEMENT.get(board) || [];
};

export const addSelectedElement = (board: PlaitBoard, element: PlaitElement) => {
    const selectedElements = getSelectedElements(board);
    cacheSelectedElements(board, [...selectedElements, element]);
};

export const removeSelectedElement = (board: PlaitBoard, element: PlaitElement) => {
    const selectedElements = getSelectedElements(board);
    const newselectedElements = selectedElements.filter(value => value !== element);
    cacheSelectedElements(board, newselectedElements);
};

export const isSelectedElement = (board: PlaitBoard, element: PlaitElement) => {
    const selectedElements = getSelectedElements(board);
    return !!selectedElements.find(value => value === element);
};
