import { PlaitBoard } from '../interfaces/board';
import { Ancestor } from '../interfaces/node';
import { depthFirstRecursion, getIsRecursionFunc } from './tree';
import { BOARD_TO_SELECTED_ELEMENT } from './weak-maps';
import { Selection } from '../interfaces/selection';
import { PlaitElement } from '../interfaces/element';
import { Point } from '../interfaces/point';
import { sortElements } from './position';
import { RectangleClient } from '../interfaces/rectangle-client';
import { getRectangleByElements } from './element';
import { PlaitOptionsBoard } from '../plugins/with-options';
import { isDebug } from './debug';
import { PlaitPluginKey, WithSelectionPluginOptions } from '../interfaces/plugin';

export const getHitElementsBySelection = (
    board: PlaitBoard,
    selection?: Selection,
    match: (element: PlaitElement) => boolean = () => true
) => {
    const newSelection = selection || (board.selection as Selection);
    const rectangleHitElements: PlaitElement[] = [];
    if (!newSelection) {
        return [];
    }
    const isCollapsed = Selection.isCollapsed(newSelection);
    if (isCollapsed) {
        const hitElements = getHitElementsByPoint(board, newSelection.anchor, match);
        if (hitElements?.length) {
            return hitElements;
        } else {
            return [];
        }
    }
    depthFirstRecursion<Ancestor>(
        board,
        node => {
            if (!PlaitBoard.isBoard(node) && match(node)) {
                let isRectangleHit = false;
                try {
                    isRectangleHit = board.isRectangleHit(node, newSelection);
                } catch (error) {
                    if (isDebug()) {
                        console.error('isRectangleHit', error, 'node', node);
                    }
                }
                if (isRectangleHit) {
                    rectangleHitElements.push(node);
                }
            }
        },
        getIsRecursionFunc(board),
        true
    );
    return rectangleHitElements;
};

export const getHitElementsByPoint = (
    board: PlaitBoard,
    point: Point,
    match: (element: PlaitElement) => boolean = () => true
): PlaitElement[] => {
    let hitElements: PlaitElement[] = [];
    depthFirstRecursion<Ancestor>(
        board,
        node => {
            if (PlaitBoard.isBoard(node) || !match(node) || !PlaitElement.hasMounted(node)) {
                return;
            }
            let isHit = false;
            try {
                isHit = board.isHit(node, point);
            } catch (error) {
                if (isDebug()) {
                    console.error('isHit', error, 'node', node);
                }
            }
            if (isHit) {
                hitElements.push(node);
                return;
            }
        },
        getIsRecursionFunc(board),
        true
    );
    return hitElements;
};

export const getHitElementByPoint = (
    board: PlaitBoard,
    point: Point,
    match: (element: PlaitElement) => boolean = () => true
): undefined | PlaitElement => {
    const pointHitElements = getHitElementsByPoint(board, point, match);
    const hitElement = board.getHitElement(pointHitElements);
    return hitElement;
};

export const getHitSelectedElements = (board: PlaitBoard, point: Point) => {
    const selectedElements = getSelectedElements(board);
    const targetRectangle = selectedElements.length > 0 && getRectangleByElements(board, selectedElements, false);
    const isInTargetRectangle = targetRectangle && RectangleClient.isPointInRectangle(targetRectangle, point);
    if (isInTargetRectangle) {
        return selectedElements;
    } else {
        return [];
    }
};

export const cacheSelectedElements = (board: PlaitBoard, selectedElements: PlaitElement[]) => {
    const sortedElements = sortElements(board, selectedElements);
    BOARD_TO_SELECTED_ELEMENT.set(board, sortedElements);
};

export const getSelectedElements = (board: PlaitBoard) => {
    return BOARD_TO_SELECTED_ELEMENT.get(board) || [];
};

export const addSelectedElement = (board: PlaitBoard, element: PlaitElement | PlaitElement[]) => {
    let elements = [];
    if (Array.isArray(element)) {
        elements.push(...element);
    } else {
        elements.push(element);
    }
    const selectedElements = getSelectedElements(board);
    cacheSelectedElements(board, [...selectedElements, ...elements]);
};

export const removeSelectedElement = (board: PlaitBoard, element: PlaitElement, isRemoveChildren = false) => {
    const selectedElements = getSelectedElements(board);
    if (selectedElements.includes(element)) {
        const targetElements: PlaitElement[] = [];
        if (board.isRecursion(element) && isRemoveChildren) {
            depthFirstRecursion(
                element,
                node => {
                    targetElements.push(node);
                },
                node => board.isRecursion(node)
            );
        } else {
            targetElements.push(element);
        }
        const newSelectedElements = selectedElements.filter(value => !targetElements.includes(value));
        cacheSelectedElements(board, newSelectedElements);
    }
};

export const replaceSelectedElement = (board: PlaitBoard, element: PlaitElement, newElement: PlaitElement) => {
    const selectedElements = getSelectedElements(board);
    selectedElements.splice(selectedElements.indexOf(element), 1, newElement);
};

export const clearSelectedElement = (board: PlaitBoard) => {
    cacheSelectedElements(board, []);
};

export const isSelectedElement = (board: PlaitBoard, element: PlaitElement) => {
    const selectedElements = getSelectedElements(board);
    return !!selectedElements.find(value => value === element);
};

export const temporaryDisableSelection = (board: PlaitOptionsBoard) => {
    const currentOptions = board.getPluginOptions(PlaitPluginKey.withSelection);
    board.setPluginOptions<WithSelectionPluginOptions>(PlaitPluginKey.withSelection, {
        isDisabledSelection: true
    });
    setTimeout(() => {
        board.setPluginOptions<WithSelectionPluginOptions>(PlaitPluginKey.withSelection, { ...currentOptions });
    }, 0);
};

export const isHitSelectedRectangle = (board: PlaitBoard, point: Point) => {
    const hitSelectedElements = getHitSelectedElements(board, point);
    return hitSelectedElements.length > 0;
};

export const isHitElement = (board: PlaitBoard, point: Point) => {
    const hitElement = getHitElementByPoint(board, point);
    return !!hitElement || isHitSelectedRectangle(board, point);
};
