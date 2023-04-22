import { PlaitBoard } from '../interfaces/board';
import { Ancestor, PlaitNode } from '../interfaces/node';
import { depthFirstRecursion } from './tree';
import { BOARD_TO_SELECTED_ELEMENT } from './weak-maps';
import { Range } from '../interfaces/selection';
import { PlaitElement } from '../interfaces/element';

export const calcElementIntersectionSelection = (board: PlaitBoard) => {
    const selectedElements: PlaitElement[] = [];
    depthFirstRecursion<Ancestor>(board, node => {
        if (
            PlaitElement.isElement(node) &&
            board.selection?.ranges.some(range => {
                return board.isHitSelection(node, range);
            })
        ) {
            selectedElements.push(node);
        }
    });
    return selectedElements;
};

export const isIntersectionElements = (board: PlaitBoard, elements: PlaitElement[], ranges: Range[]) => {
    let isIntersectionElements = false;
    if (elements.length) {
        elements.map(item => {
            if (!isIntersectionElements) {
                isIntersectionElements = ranges.some(range => {
                    return board.isHitSelection(item, range);
                });
            }
        });
    }
    return isIntersectionElements;
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
    const newSelectedElements = selectedElements.filter(value => value !== element);
    cacheSelectedElements(board, newSelectedElements);
};

export const isSelectedElement = (board: PlaitBoard, element: PlaitElement) => {
    const selectedElements = getSelectedElements(board);
    return !!selectedElements.find(value => value === element);
};
