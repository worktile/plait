import { PlaitBoard } from '../interfaces/board';
import { Ancestor } from '../interfaces/node';
import { depthFirstRecursion, getIsRecursionFunc } from './tree';
import { BOARD_TO_SELECTED_ELEMENT } from './weak-maps';
import { Selection } from '../interfaces/selection';
import { PlaitElement } from '../interfaces/element';
import { Point } from '../interfaces/point';

export const getHitElementsBySelection = (
    board: PlaitBoard,
    selection?: Selection,
    match: (element: PlaitElement) => boolean = () => true
) => {
    const newSelection = selection || board.selection as Selection;
    const rectangleHitElements: PlaitElement[] = [];
    const isCollapsed = newSelection && Selection.isCollapsed(newSelection);
    if (isCollapsed) {
        const hitElement = getHitElementByPoint(board, newSelection.anchor, match);
        if (hitElement) {
            return [hitElement];
        } else {
            return [];
        }
    }
    depthFirstRecursion<Ancestor>(
        board,
        node => {
            if (!PlaitBoard.isBoard(node) && match(node) && board.isRectangleHit(node, newSelection)) {
                rectangleHitElements.push(node);
            }
        },
        getIsRecursionFunc(board),
        true
    );
    return rectangleHitElements;
};

export const getHitElementByPoint = (
    board: PlaitBoard,
    point: Point,
    match: (element: PlaitElement) => boolean = () => true
): undefined | PlaitElement => {
    let rectangleHitElement: PlaitElement | undefined = undefined;
    let hitElement: PlaitElement | undefined = undefined;
    depthFirstRecursion<Ancestor>(
        board,
        node => {
            if (hitElement) {
                return;
            }
            if (PlaitBoard.isBoard(node) || !match(node)) {
                return;
            }
            if (board.isHit(node, point)) {
                hitElement = node;
                return;
            }
            if (!rectangleHitElement && board.isRectangleHit(node, { anchor: point, focus: point })) {
                rectangleHitElement = node;
            }
        },
        getIsRecursionFunc(board),
        true
    );
    return hitElement || rectangleHitElement;
};

export const getHitElementInElements = (board: PlaitBoard, point: Point, elements: PlaitElement[], isReverse = true) => {
    const newElements = [...elements].reverse();
    let rectangleHitElement;
    for (let index = 0; index < newElements.length; index++) {
        const element = newElements[index];
        if (board.isHit(element, point)) {
            return element;
        }
        if (!rectangleHitElement && board.isRectangleHit(element, { anchor: point, focus: point })) {
            rectangleHitElement;
        }
    }
    return rectangleHitElement;
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
