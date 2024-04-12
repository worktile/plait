import { getSelectedElements, PlaitBoard, PlaitElement } from '@plait/core';

export const ascendingSortElements = (board: PlaitBoard, elements: PlaitElement[] = []) => {
    return elements.sort((a, b) => {
        const indexA = board.children.findIndex(child => child.id === a.id);
        const indexB = board.children.findIndex(child => child.id === b.id);
        return indexA - indexB;
    });
};

export const canSetZIndex = (board: PlaitBoard) => {
    const selectedElements = getSelectedElements(board).filter(item => board.canSetZIndex(item));
    return selectedElements.length > 0;
};

export const findLastIndex = <T>(
    array: readonly T[],
    cb: (element: T, index: number, array: readonly T[]) => boolean,
    fromIndex: number = array.length - 1
) => {
    if (fromIndex < 0) {
        fromIndex = array.length + fromIndex;
    }
    fromIndex = Math.min(array.length - 1, Math.max(fromIndex, 0));
    let index = fromIndex + 1;
    while (--index > -1) {
        if (cb(array[index], index, array)) {
            return index;
        }
    }
    return -1;
};

export const findIndex = <T>(
    array: readonly T[],
    cb: (element: T, index: number, array: readonly T[]) => boolean,
    fromIndex: number = 0
) => {
    // fromIndex = 2
    if (fromIndex < 0) {
        fromIndex = array.length + fromIndex;
    }
    fromIndex = Math.min(array.length, Math.max(fromIndex, 0));
    let index = fromIndex - 1;
    while (++index < array.length) {
        if (cb(array[index], index, array)) {
            return index;
        }
    }
    return -1;
};
