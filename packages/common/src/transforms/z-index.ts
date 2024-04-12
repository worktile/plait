import {
    Path,
    PlaitBoard,
    PlaitElement,
    PlaitGroup,
    PlaitGroupElement,
    Transforms,
    getEditingGroup,
    getElementsInGroup,
    getGroupByElement,
    getSelectedElements,
    getSelectedGroups
} from '@plait/core';
import { arrayToMap, findIndex, findLastIndex } from '../utils';

interface ZIndexMoveOptions {
    element: PlaitElement;
    newPath: Path;
}

export const moveToTop = () => {};

export const moveToBottom = () => {};

export const moveUp = (board: PlaitBoard) => {
    const zIndexMoveOptions = getZIndexMoveOptionsByOne(board, 'up');
    moveElementsToNewPath(board, zIndexMoveOptions);
};

export const moveDown = (board: PlaitBoard) => {
    const zIndexMoveOptions = getZIndexMoveOptionsByOne(board, 'down');
    moveElementsToNewPath(board, zIndexMoveOptions);
};

const moveElementsToNewPath = (board: PlaitBoard, zIndexMoveOptions: ZIndexMoveOptions[]) => {
    zIndexMoveOptions
        .map(item => {
            const path = PlaitBoard.findPath(board, item.element);
            const ref = board.pathRef(path);
            return () => {
                ref.current && Transforms.moveNode(board, ref.current, item.newPath);
                ref.unref();
            };
        })
        .forEach(action => {
            action();
        });
};

const getZIndexMoveOptionsByOne = (board: PlaitBoard, direction: 'down' | 'up'): ZIndexMoveOptions[] => {
    const indicesToMove = getIndicesToMove(board);
    let groupedIndices = toContiguousGroups(board, indicesToMove);
    if (direction === 'up') {
        groupedIndices = groupedIndices.reverse();
    }
    let moveContents: ZIndexMoveOptions[] = [];
    groupedIndices.forEach((indices, i) => {
        const leadingIndex = indices[0];
        const trailingIndex = indices[indices.length - 1];
        const boundaryIndex = direction === 'down' ? leadingIndex : trailingIndex;
        const targetIndex = getTargetIndex(board, boundaryIndex, direction);
        if (targetIndex === -1 || boundaryIndex === targetIndex) {
            return;
        }
        if (direction === 'down') {
            moveContents.push(
                ...indices.reverse().map(path => {
                    return {
                        element: board.children[path],
                        newPath: [targetIndex]
                    };
                })
            );
        } else {
            moveContents.push(
                ...indices.map(path => {
                    return {
                        element: board.children[path],
                        newPath: [targetIndex]
                    };
                })
            );
        }
    });

    return moveContents;
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
    const selectedElementIds = arrayToMap(
        elementsToBeMoved ? elementsToBeMoved : [...getSelectedElements(board), ...getSelectedGroups(board)]
    );
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

const toContiguousGroups = (board: PlaitBoard, array: number[]) => {
    let cursor = 0;
    return array.reduce((acc, value, index) => {
        if (index > 0) {
            const currentElement = board.children[value];
            const previousElement = board.children[array[index - 1]];
            const isInSameGroup = currentElement.groupId === previousElement.groupId;
            const isContain = currentElement.id === previousElement.groupId || currentElement.groupId === previousElement.id;
            if (array[index - 1] !== value - 1 || (!isInSameGroup && !isContain)) {
                cursor = ++cursor;
            }
        }
        (acc[cursor] || (acc[cursor] = [])).push(value);
        return acc;
    }, [] as number[][]);
};

/**
 * Returns next candidate index that's available to be moved to. Currently that
 *  is a non-deleted element, and not inside a group (unless we're editing it).
 */
const getTargetIndex = (board: PlaitBoard, boundaryIndex: number, direction: 'down' | 'up') => {
    if ((boundaryIndex === 0 && direction === 'down') || (boundaryIndex === board.children.length - 1 && direction === 'up')) {
        return -1;
    }
    const indexFilter = (element: PlaitElement) => {
        if (element.isDeleted || PlaitGroupElement.isGroup(element)) {
            return false;
        }
        return true;
    };
    const candidateIndex =
        direction === 'down'
            ? findLastIndex(board.children, el => indexFilter(el), Math.max(0, boundaryIndex - 1))
            : findIndex(board.children, el => indexFilter(el), boundaryIndex + 1);

    const nextElement = board.children[candidateIndex];
    if (!nextElement) {
        return -1;
    }

    if (!nextElement.groupId) {
        return candidateIndex;
    }

    const elements = [...board.children];
    const sourceElement = elements[boundaryIndex];
    const editingGroup = getEditingGroup(board, sourceElement);
    const nextElementGroups = (getGroupByElement(board, nextElement, true) || []) as PlaitGroup[];
    // candidate element is a sibling in current editing group → return
    if (editingGroup && sourceElement?.groupId !== nextElement?.groupId) {
        // candidate element is outside current editing group → prevent
        if (!(nextElementGroups as PlaitGroup[]).find(item => item.id === editingGroup.id)) {
            return -1;
        }
    }
    let siblingGroup: PlaitGroup;
    if (editingGroup) {
        siblingGroup = nextElementGroups[nextElementGroups.indexOf(editingGroup) - 1];
    } else {
        siblingGroup = nextElementGroups[nextElementGroups.length - 1];
    }
    if (siblingGroup) {
        let elementsInSiblingGroup = getElementsInGroup(board, siblingGroup, true, true);
        if (elementsInSiblingGroup.length) {
            elementsInSiblingGroup = [...elementsInSiblingGroup, siblingGroup];
            elementsInSiblingGroup.sort((a, b) => {
                const indexA = board.children.findIndex(child => child.id === a.id);
                const indexB = board.children.findIndex(child => child.id === b.id);
                return indexA - indexB;
            });
            // assumes getElementsInGroup() returned elements are sorted
            // by zIndex (ascending)
            return direction === 'down'
                ? elements.indexOf(elementsInSiblingGroup[0])
                : elements.indexOf(elementsInSiblingGroup[elementsInSiblingGroup.length - 1]);
        }
    }

    return candidateIndex;
};

export const ZIndexTransforms = { moveUp, moveDown, moveToTop, moveToBottom };
