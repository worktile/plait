import { PlaitBoard } from '../interfaces/board';
import { Point } from '../interfaces/point';
import { Transforms } from '../transforms';
import { isMainPointer } from '../utils/dom/common';
import { RectangleClient } from '../interfaces/rectangle-client';
import {
    cacheSelectedElements,
    clearSelectedElement,
    getHitElementsBySelection,
    getSelectedElements,
    isHitElement,
    removeSelectedElement
} from '../utils/selected-element';
import { PlaitElement, PlaitPointerType, SELECTION_BORDER_COLOR, SELECTION_FILL_COLOR } from '../interfaces';
import { ATTACHED_ELEMENT_CLASS_NAME } from '../constants/selection';
import {
    clearSelectionMoving,
    deleteTemporaryElements,
    drawRectangle,
    getTemporaryElements,
    isDragging,
    isHandleSelection,
    isSelectionMoving,
    isSetSelectionOperation,
    preventTouchMove,
    setSelectionMoving,
    throttleRAF,
    toHostPoint,
    toViewBoxPoint,
    setSelectedElementsWithGroup
} from '../utils';
import { PlaitOptionsBoard, PlaitPluginOptions } from './with-options';
import { PlaitPluginKey } from '../interfaces/plugin-key';
import { Selection } from '../interfaces/selection';
import { PRESS_AND_MOVE_BUFFER } from '../constants';

export interface WithPluginOptions extends PlaitPluginOptions {
    isMultiple: boolean;
    isDisabledSelect: boolean;
}

export function withSelection(board: PlaitBoard) {
    const { pointerDown, pointerUp, pointerMove, globalPointerUp, onChange, afterChange, drawActiveRectangle } = board;
    let start: Point | null = null;
    let end: Point | null = null;
    let selectionMovingG: SVGGElement;
    let selectionRectangleG: SVGGElement | null;
    let previousSelectedElements: PlaitElement[];
    let isShift = false;

    board.pointerDown = (event: PointerEvent) => {
        if (!isShift && event.shiftKey) {
            isShift = true;
        }
        if (isShift && !event.shiftKey) {
            isShift = false;
        }
        const isHitText = !!(event.target instanceof Element && event.target.closest('.plait-richtext-container'));

        const point = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
        const isHitTarget = isHitElement(board, point);
        const options = (board as PlaitOptionsBoard).getPluginOptions<WithPluginOptions>(PlaitPluginKey.withSelection);
        if (PlaitBoard.isPointer(board, PlaitPointerType.selection) && !isHitTarget && options.isMultiple && !options.isDisabledSelect) {
            preventTouchMove(board, event, true);
            // start rectangle selection
            start = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
        }
        pointerDown(event);
    };

    board.pointerMove = (event: PointerEvent) => {
        if (PlaitBoard.isPointer(board, PlaitPointerType.selection) && start) {
            const movedTarget = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
            const rectangle = RectangleClient.getRectangleByPoints([start, movedTarget]);
            selectionMovingG?.remove();
            if (Math.hypot(rectangle.width, rectangle.height) > PRESS_AND_MOVE_BUFFER || isSelectionMoving(board)) {
                end = movedTarget;
                throttleRAF(board, 'with-selection', () => {
                    if (start && end) {
                        Transforms.setSelection(board, { anchor: start, focus: end });
                    }
                });
                setSelectionMoving(board);
                selectionMovingG = drawRectangle(board, rectangle, {
                    stroke: SELECTION_BORDER_COLOR,
                    strokeWidth: 1,
                    fill: SELECTION_FILL_COLOR,
                    fillStyle: 'solid'
                });
                PlaitBoard.getElementActiveHost(board).append(selectionMovingG);
            }
        }
        pointerMove(event);
    };

    // handle the end of click select
    board.pointerUp = (event: PointerEvent) => {
        const isSetSelectionPointer =
            PlaitBoard.isPointer(board, PlaitPointerType.selection) || PlaitBoard.isPointer(board, PlaitPointerType.hand);
        const isSkip = !isMainPointer(event) || isDragging(board) || !isSetSelectionPointer;
        if (isSkip) {
            pointerUp(event);
            return;
        }
        const point = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
        const selection = { anchor: point, focus: point };
        Transforms.setSelection(board, selection);
        pointerUp(event);
    };

    board.globalPointerUp = (event: PointerEvent) => {
        if (start && end) {
            selectionMovingG?.remove();
            clearSelectionMoving(board);
            Transforms.setSelection(board, { anchor: start, focus: end });
        }

        if (PlaitBoard.isFocus(board)) {
            const isInBoard = event.target instanceof Node && PlaitBoard.getBoardContainer(board).contains(event.target);
            const isInDocument = event.target instanceof Node && document.contains(event.target);
            const isAttachedElement = event.target instanceof Element && event.target.closest(`.${ATTACHED_ELEMENT_CLASS_NAME}`);
            // Clear selection when mouse board outside area
            // The framework needs to determine whether the board is focused through selection
            if (!isInBoard && !start && !isAttachedElement && isInDocument) {
                Transforms.setSelection(board, null);
            }
        }
        start = null;
        end = null;
        preventTouchMove(board, event, false);
        globalPointerUp(event);
    };

    board.onChange = () => {
        const options = (board as PlaitOptionsBoard).getPluginOptions<WithPluginOptions>(PlaitPluginKey.withSelection);
        if (options.isDisabledSelect) {
            clearSelectedElement(board);
        }
        // remove selected element if include
        board.operations.forEach(op => {
            if (op.type === 'remove_node') {
                removeSelectedElement(board, op.node, true);
            }
        });
        if (isHandleSelection(board) && isSetSelectionOperation(board)) {
            try {
                if (!isShift) {
                    selectionRectangleG?.remove();
                }
                const temporaryElements = getTemporaryElements(board);
                if (temporaryElements) {
                    cacheSelectedElements(board, [...temporaryElements]);
                } else {
                    let elements = getHitElementsBySelection(board);
                    if (!options.isMultiple && elements.length > 1) {
                        elements = [elements[0]];
                    }
                    const isHitElementWithGroup = elements.some(item => item.groupId);
                    const selectedElements = getSelectedElements(board);
                    if (isHitElementWithGroup) {
                        setSelectedElementsWithGroup(board, elements, isShift);
                    } else {
                        if (isShift) {
                            const newElements = [...selectedElements];
                            if (board.selection && Selection.isCollapsed(board.selection)) {
                                elements.forEach(element => {
                                    if (newElements.includes(element)) {
                                        newElements.splice(newElements.indexOf(element), 1);
                                    } else {
                                        newElements.push(element);
                                    }
                                });
                                cacheSelectedElements(board, newElements);
                            } else {
                                elements.forEach(element => {
                                    if (!newElements.includes(element)) {
                                        newElements.push(element);
                                    }
                                });
                                cacheSelectedElements(board, [...newElements]);
                            }
                        } else {
                            cacheSelectedElements(board, [...elements]);
                        }
                    }
                }
                const newElements = getSelectedElements(board);
                previousSelectedElements = newElements;
                deleteTemporaryElements(board);
                if (!isSelectionMoving(board)) {
                    selectionRectangleG?.remove();
                    if (newElements.length > 1) {
                        selectionRectangleG = board.drawActiveRectangle();
                        PlaitBoard.getElementActiveHost(board).append(selectionRectangleG!);
                    }
                }
            } catch (error) {
                console.error(error);
            }
        }
        onChange();
    };

    board.afterChange = () => {
        if (isHandleSelection(board) && !isSetSelectionOperation(board)) {
            try {
                const currentSelectedElements = getSelectedElements(board);
                if (currentSelectedElements.length && currentSelectedElements.length > 1) {
                    if (
                        previousSelectedElements &&
                        (currentSelectedElements.length !== previousSelectedElements.length ||
                            currentSelectedElements.some((c, index) => c !== previousSelectedElements[index]))
                    ) {
                        selectionRectangleG?.remove();
                        selectionRectangleG = board.drawActiveRectangle();
                        PlaitBoard.getElementActiveHost(board).append(selectionRectangleG!);
                        previousSelectedElements = currentSelectedElements;
                    }
                } else {
                    selectionRectangleG?.remove();
                }
            } catch (error) {
                console.error(error);
            }
        }
        afterChange();
    };

    (board as PlaitOptionsBoard).setPluginOptions<WithPluginOptions>(PlaitPluginKey.withSelection, {
        isMultiple: true,
        isDisabledSelect: false
    });

    return board;
}
