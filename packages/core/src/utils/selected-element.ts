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
import { PlaitPluginKey } from '../interfaces/plugin-key';
import { WithPluginOptions } from '../plugins/with-selection';

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
    let hitElement: PlaitElement | undefined = undefined;
    let hitInsideElement: PlaitElement | undefined = undefined;
    depthFirstRecursion<Ancestor>(
        board,
        node => {
            if (hitElement) {
                return;
            }
            if (PlaitBoard.isBoard(node) || !match(node) || !PlaitElement.hasMounted(node)) {
                return;
            }
            if (board.isHit(node, point)) {
                hitElement = node;
                return;
            }

            /**
             * 需要增加场景测试
             * hitInsideElement 存的是第一个符合 isInsidePoint 的元素
             * 当有元素符合 isHit 时结束遍历，并返回 hitElement
             * 当所有元素都不符合 isHit ，则返回第一个符合 isInsidePoint 的元素
             * 这样保证最上面的元素优先被探测到；
             */

            if (!hitInsideElement && board.isInsidePoint(node, point)) {
                hitInsideElement = node;
            }
        },
        getIsRecursionFunc(board),
        true
    );
    return hitElement || hitInsideElement;
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

export const isHitSelectedRectangle = (board: PlaitBoard, point: Point) => {
    const hitSelectedElements = getHitSelectedElements(board, point);
    return hitSelectedElements.length > 0;
};

export const isHitElement = (board: PlaitBoard, point: Point) => {
    const hitElement = getHitElementByPoint(board, point);
    return !!hitElement || isHitSelectedRectangle(board, point);
};
