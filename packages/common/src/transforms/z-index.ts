import {
    CoreTransforms,
    PlaitBoard,
    PlaitElement,
    RectangleClient,
    Transforms,
    addSelectedElement,
    getRectangleByElements,
    getSelectedElements
} from '@plait/core';
import { arrayToMap, findIndex, findLastIndex } from '../utils';
import { getRectangleByElement } from '@plait/mind';

// export const bringForward = (board: PlaitBoard) => {
//     const selectElement
// };
//  moveToTop
//  moveToBottom
//  moveUp
//  moveDown

export const moveToTop = () => {};

export const moveToBottom = () => {};

export const moveUp = (board: PlaitBoard) => {
    const selectedElements = getSelectedElements(board);
    const rectangle = getRectangleByElements(board, selectedElements, false);
    const points = RectangleClient.getPoints(rectangle);
    const elements = shiftElementsByOne(board, 'right');
    board.children = elements;
    board.onChange();
    // CoreTransforms.removeElements(board, board.children);
    // elements.forEach(item => {
    //     Transforms.insertNode(board, item, [board.children.length]);
    // });
};

export const moveDown = (board: PlaitBoard) => {
    const elements = shiftElementsByOne(board, 'left');
    console.log('down', elements);
};

const shiftElementsByOne = (board: PlaitBoard, direction: 'left' | 'right') => {
    const indicesToMove = getIndicesToMove(board);
    let groupedIndices = toContiguousGroups(indicesToMove);

    if (direction === 'right') {
        groupedIndices = groupedIndices.reverse();
    }
    let elements = [...board.children];

    groupedIndices.forEach((indices, i) => {
        const leadingIndex = indices[0];
        const trailingIndex = indices[indices.length - 1];
        const boundaryIndex = direction === 'left' ? leadingIndex : trailingIndex;
        const targetIndex = getTargetIndex(board, boundaryIndex, direction);
        if (targetIndex === -1 || boundaryIndex === targetIndex) {
            return;
        }
        const leadingElements = direction === 'left' ? elements.slice(0, targetIndex) : elements.slice(0, leadingIndex);
        const targetElements = elements.slice(leadingIndex, trailingIndex + 1);
        const displacedElements =
            direction === 'left' ? elements.slice(targetIndex, leadingIndex) : elements.slice(trailingIndex + 1, targetIndex + 1);
        const trailingElements = direction === 'left' ? elements.slice(trailingIndex + 1) : elements.slice(targetIndex + 1);

        elements =
            direction === 'left'
                ? [...leadingElements, ...targetElements, ...displacedElements, ...trailingElements]
                : [...leadingElements, ...displacedElements, ...targetElements, ...trailingElements];
    });

    return elements;
};

/**
 * Returns indices of elements to move based on selected elements.
 * Includes contiguous deleted elements that are between two selected elements,
 *  e.g.: [0 (selected), 1 (deleted), 2 (deleted), 3 (selected)]
 *
 * Specified elements (elementsToBeMoved) take precedence over
 * appState.selectedElementsIds
 */
const getIndicesToMove = (board: PlaitBoard, elementsToBeMoved?: readonly PlaitElement[]) => {
    let selectedIndices: number[] = [];
    let deletedIndices: number[] = [];
    let includeDeletedIndex = null;
    let index = -1;
    const selectedElementIds = arrayToMap(elementsToBeMoved ? elementsToBeMoved : getSelectedElements(board));
    while (++index < board.children.length) {
        const element = board.children[index];
        if (selectedElementIds.get(element.id)) {
            if (deletedIndices.length) {
                selectedIndices = selectedIndices.concat(deletedIndices);
                deletedIndices = [];
            }
            selectedIndices.push(index);
            includeDeletedIndex = index + 1;
        } else if (element.isDeleted && includeDeletedIndex === index) {
            includeDeletedIndex = index + 1;
            deletedIndices.push(index);
        } else {
            deletedIndices = [];
        }
    }
    return selectedIndices;
};

const toContiguousGroups = (array: number[]) => {
    let cursor = 0;
    return array.reduce((acc, value, index) => {
        if (index > 0 && array[index - 1] !== value - 1) {
            cursor = ++cursor;
        }
        (acc[cursor] || (acc[cursor] = [])).push(value);
        return acc;
    }, [] as number[][]);
};

/**
 * Returns next candidate index that's available to be moved to. Currently that
 *  is a non-deleted element, and not inside a group (unless we're editing it).
 */
const getTargetIndex = (board: PlaitBoard, boundaryIndex: number, direction: 'left' | 'right') => {
    const indexFilter = (element: PlaitElement) => {
        if (element.isDeleted) {
            return false;
        }
        return true;
    };

    const candidateIndex =
        direction === 'left'
            ? findLastIndex(board.children, el => indexFilter(el), Math.max(0, boundaryIndex - 1))
            : findIndex(board.children, el => indexFilter(el), boundaryIndex + 1);

    const nextElement = board.children[candidateIndex];
    if (!nextElement) {
        return -1;
    }

    // if (!nextElement.groupIds?.length) {
    //     return candidateIndex;
    // }

    return candidateIndex;
};
