import { PlaitBoard } from '../interfaces/board';
import { Ancestor } from '../interfaces/node';
import { depthFirstRecursion, getIsRecursionFunc } from './tree';
import { BOARD_TO_SELECTED_ELEMENT } from './weak-maps';
import { Selection, Range } from '../interfaces/selection';
import { PlaitElement } from '../interfaces/element';

export const getHitElements = (board: PlaitBoard, selection?: Selection, match: (element: PlaitElement) => boolean = () => true) => {
    const realSelection = selection || board.selection;
    const selectedElements: PlaitElement[] = [];
    const isCollapsed = realSelection && realSelection.ranges.length === 1 && Selection.isCollapsed(realSelection.ranges[0]);
    depthFirstRecursion<Ancestor>(
        board,
        node => {
            if (selectedElements.length > 0 && isCollapsed) {
                return;
            }
            if (
                !PlaitBoard.isBoard(node) &&
                match(node) &&
                realSelection &&
                realSelection.ranges.some(range => {
                    return board.isRectangleHit(node, range);
                })
            ) {
                selectedElements.push(node);
            }
        },
        getIsRecursionFunc(board),
        true
    );
    return selectedElements;
};

export const getHitElementOfRoot = (board: PlaitBoard, rootElements: PlaitElement[], range: Range) => {
    const newRootElements = [...rootElements].reverse();
    return newRootElements.find(item => {
        return board.isRectangleHit(item, range);
    });
};

export const isHitElements = (board: PlaitBoard, elements: PlaitElement[], ranges: Range[]) => {
    let isIntersectionElements = false;
    if (elements.length) {
        elements.map(item => {
            if (!isIntersectionElements) {
                isIntersectionElements = ranges.some(range => {
                    return board.isRectangleHit(item, range);
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

export const clearSelectedElement = (board: PlaitBoard) => {
    cacheSelectedElements(board, []);
};

export const isSelectedElement = (board: PlaitBoard, element: PlaitElement) => {
    const selectedElements = getSelectedElements(board);
    return !!selectedElements.find(value => value === element);
};
