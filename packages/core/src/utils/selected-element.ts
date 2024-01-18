import { PlaitBoard } from '../interfaces/board';
import { Ancestor } from '../interfaces/node';
import { depthFirstRecursion, getIsRecursionFunc } from './tree';
import { BOARD_TO_SELECTED_ELEMENT } from './weak-maps';
import { Selection } from '../interfaces/selection';
import { PlaitElement } from '../interfaces/element';
import { Point } from '../interfaces/point';
import { PlaitOptionsBoard, PlaitPluginKey, WithPluginOptions } from '../public-api';
import { sortElements } from './position';
import { RectangleClient } from '../interfaces/rectangle-client';
import { getRectangleByElements } from './element';

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

export const clearSelectedElement = (board: PlaitBoard) => {
    cacheSelectedElements(board, []);
};

export const isSelectedElement = (board: PlaitBoard, element: PlaitElement) => {
    const selectedElements = getSelectedElements(board);
    return !!selectedElements.find(value => value === element);
};

export const temporaryDisableSelection = (board: PlaitOptionsBoard) => {
    const currentOptions = board.getPluginOptions(PlaitPluginKey.withSelection);
    board.setPluginOptions<WithPluginOptions>(PlaitPluginKey.withSelection, {
        isDisabledSelect: true
    });
    setTimeout(() => {
        board.setPluginOptions<WithPluginOptions>(PlaitPluginKey.withSelection, { ...currentOptions });
    }, 0);
};
