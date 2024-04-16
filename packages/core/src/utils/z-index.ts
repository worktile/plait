import { PlaitBoard, PlaitElement, PlaitGroupElement, PlaitGroup } from '../interfaces';
import { MoveNodeOption, getElementsIndices } from './common';
import { getEditingGroup, getElementsInGroup, getGroupByElement, getSelectedGroups } from './group';
import { findIndex, findLastIndex } from './helper';
import { sortElements } from './position';
import { getSelectedElements } from './selected-element';

export const getOneMoveOptions = (board: PlaitBoard, direction: 'down' | 'up'): MoveNodeOption[] => {
    const indicesToMove = getIndicesToMove(board);
    let groupedIndices = toContiguousGroups(board, indicesToMove);
    if (direction === 'up') {
        groupedIndices = groupedIndices.reverse();
    }
    let moveContents: MoveNodeOption[] = [];
    groupedIndices.forEach((indices, i) => {
        const leadingIndex = indices[0];
        const trailingIndex = indices[indices.length - 1];
        const boundaryIndex = direction === 'down' ? leadingIndex : trailingIndex;
        const targetIndex = getTargetIndex(board, boundaryIndex, direction);
        if (targetIndex === -1 || boundaryIndex === targetIndex) {
            return;
        }
        if (direction === 'down') {
            indices = indices.reverse();
        }
        moveContents.push(
            ...indices.map(path => {
                return {
                    element: board.children[path],
                    newPath: [targetIndex]
                };
            })
        );
    });

    return moveContents;
};

export const getAllMoveOptions = (board: PlaitBoard, direction: 'down' | 'up'): MoveNodeOption[] => {
    const indicesToMove = getIndicesToMove(board);
    let groupedIndices = toContiguousGroups(board, indicesToMove);
    let moveContents: MoveNodeOption[] = [];
    if (direction === 'down') {
        groupedIndices = groupedIndices.reverse();
    }
    groupedIndices.forEach(indices => {
        const leadingIndex = indices[0];
        const trailingIndex = indices[indices.length - 1];
        const boundaryIndex = direction === 'down' ? leadingIndex : trailingIndex;
        const sourceElement = board.children[boundaryIndex];
        const editingGroup = getEditingGroup(board, sourceElement);
        let targetIndex = direction === 'down' ? 0 : board.children.length - 1;
        if (editingGroup) {
            const elementsInGroup = sortElements(board, getElementsInGroup(board, editingGroup, true, true));
            targetIndex =
                direction === 'down'
                    ? board.children.indexOf(elementsInGroup[0])
                    : board.children.indexOf(elementsInGroup[elementsInGroup.length - 1]);
        }
        if (direction === 'down') {
            indices = indices.reverse();
        }
        moveContents.push(
            ...indices.map(path => {
                return {
                    element: board.children[path],
                    newPath: [targetIndex]
                };
            })
        );
    });

    return moveContents;
};

export const canSetZIndex = (board: PlaitBoard) => {
    const selectedElements = getSelectedElements(board).filter(item => board.canSetZIndex(item));
    return selectedElements.length > 0;
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

    if (!nextElement.groupId) {
        return candidateIndex;
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

const getIndicesToMove = (board: PlaitBoard) => {
    const selectedElements = [...getSelectedElements(board), ...getSelectedGroups(board)];
    return getElementsIndices(board, selectedElements);
};
