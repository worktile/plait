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
import { PlaitPointerType, SELECTION_BORDER_COLOR, SELECTION_FILL_COLOR } from '../interfaces';
import { ATTACHED_ELEMENT_CLASS_NAME } from '../constants/selection';
import {
    clearSelectionMoving,
    deleteTemporaryElements,
    drawRectangle,
    getTemporaryElements,
    isDragging,
    isHandleSelection,
    isSelectionMoving,
    setSelectionMoving,
    throttleRAF,
    toHostPoint,
    toViewBoxPoint,
    setSelectedElementsWithGroup,
    hasSetSelectionOperation,
    getSelectionOptions,
    setSelectionOptions,
    distanceBetweenPointAndPoint,
    isMobileDeviceEvent,
    toActivePoint
} from '../utils';
import { Selection } from '../interfaces/selection';
import { DRAG_SELECTION_PRESS_AND_MOVE_BUFFER } from '../constants';

export function withSelection(board: PlaitBoard) {
    const { pointerDown, pointerUp, pointerMove, globalPointerUp, onChange, afterChange, drawSelectionRectangle } = board;
    let screenStart: Point | null = null;
    let screenEnd: Point | null = null;
    let selectionMovingG: SVGGElement;
    let selectionRectangleG: SVGGElement | null;
    let isShift = false;
    let timerId: ReturnType<typeof setTimeout> | null = null;
    let pointerDownEvent: PointerEvent | null = null;

    board.pointerDown = (event: PointerEvent) => {
        if (!isShift && event.shiftKey) {
            isShift = true;
        }
        if (isShift && !event.shiftKey) {
            isShift = false;
        }
        const point = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
        const isHitTarget = isHitElement(board, point);
        const options = getSelectionOptions(board);
        if (
            PlaitBoard.isPointer(board, PlaitPointerType.selection) &&
            isMainPointer(event) &&
            !isHitTarget &&
            options.isMultipleSelection &&
            !options.isDisabledSelection
        ) {
            if (isMobileDeviceEvent(event)) {
                timerId = setTimeout(() => {
                    screenStart = [event.x, event.y];
                    timerId = null;
                }, 120);
            } else {
                screenStart = [event.x, event.y];
            }
        }
        pointerDownEvent = event;
        pointerDown(event);
    };

    board.pointerMove = (event: PointerEvent) => {
        if (
            timerId &&
            pointerDownEvent &&
            distanceBetweenPointAndPoint(pointerDownEvent.x, pointerDownEvent.y, event.x, event.y) > DRAG_SELECTION_PRESS_AND_MOVE_BUFFER
        ) {
            clearTimeout(timerId);
            timerId = null;
        }
        if (PlaitBoard.isPointer(board, PlaitPointerType.selection) && screenStart) {
            event.preventDefault();
            screenEnd = [event.x, event.y];
            const rectangle = RectangleClient.getRectangleByPoints([
                toActivePoint(board, ...screenStart),
                toActivePoint(board, ...screenEnd)
            ]);
            selectionMovingG?.remove();
            throttleRAF(board, 'with-selection', () => {
                if (screenStart && screenEnd) {
                    Transforms.setSelection(board, {
                        anchor: toViewBoxPoint(board, toHostPoint(board, screenStart[0], screenStart[1])),
                        focus: toViewBoxPoint(board, toHostPoint(board, screenEnd[0], screenEnd[1]))
                    });
                }
            });
            setSelectionMoving(board);
            selectionMovingG = drawRectangle(board, rectangle, {
                stroke: SELECTION_BORDER_COLOR,
                strokeWidth: 1,
                fill: SELECTION_FILL_COLOR,
                fillStyle: 'solid'
            });
            PlaitBoard.getActiveHost(board).append(selectionMovingG);
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
        if (screenStart && screenEnd) {
            selectionMovingG?.remove();
            clearSelectionMoving(board);
            Transforms.setSelection(board, {
                anchor: toViewBoxPoint(board, toHostPoint(board, screenStart[0], screenStart[1])),
                focus: toViewBoxPoint(board, toHostPoint(board, screenEnd[0], screenEnd[1]))
            });
        }
        const options = getSelectionOptions(board);
        if (PlaitBoard.isFocus(board) && !options.isPreventClearSelection) {
            const isInBoard = event.target instanceof Node && PlaitBoard.getBoardContainer(board).contains(event.target);
            const isInDocument = event.target instanceof Node && document.contains(event.target);
            const isAttachedElement = event.target instanceof Element && event.target.closest(`.${ATTACHED_ELEMENT_CLASS_NAME}`);
            // Clear selection when mouse board outside area
            // The framework needs to determine whether the board is focused through selection
            if (!isInBoard && !screenStart && !isAttachedElement && isInDocument) {
                Transforms.setSelection(board, null);
            }
        }
        screenStart = null;
        screenEnd = null;
        if (timerId) {
            clearTimeout(timerId);
            timerId = null;
        }
        pointerDownEvent = null;
        globalPointerUp(event);
    };

    board.onChange = () => {
        const options = getSelectionOptions(board);
        if (options.isDisabledSelection) {
            clearSelectedElement(board);
        }
        // remove selected element if include
        board.operations.forEach((op) => {
            if (op.type === 'remove_node') {
                removeSelectedElement(board, op.node, true);
            }
        });
        if (isHandleSelection(board) && hasSetSelectionOperation(board)) {
            try {
                if (!isShift) {
                    selectionRectangleG?.remove();
                }
                const temporaryElements = getTemporaryElements(board);
                if (temporaryElements) {
                    cacheSelectedElements(board, [...temporaryElements]);
                } else {
                    let elements = getHitElementsBySelection(board);
                    if (!options.isMultipleSelection && elements.length > 1) {
                        elements = [elements[0]];
                    }
                    const isHitElementWithGroup = elements.some((item) => item.groupId);
                    const selectedElements = getSelectedElements(board);
                    if (isHitElementWithGroup) {
                        setSelectedElementsWithGroup(board, elements, isShift);
                    } else {
                        if (board.selection && Selection.isCollapsed(board.selection)) {
                            const element = board.getOneHitElement(elements);
                            if (element) {
                                elements = [element];
                            }
                        }
                        if (isShift) {
                            const newElements = [...selectedElements];
                            if (board.selection && Selection.isCollapsed(board.selection)) {
                                elements.forEach((element) => {
                                    if (newElements.includes(element)) {
                                        newElements.splice(newElements.indexOf(element), 1);
                                    } else {
                                        newElements.push(element);
                                    }
                                });
                                cacheSelectedElements(board, newElements);
                            } else {
                                elements.forEach((element) => {
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
                deleteTemporaryElements(board);
                if (!isSelectionMoving(board)) {
                    selectionRectangleG?.remove();
                    if (newElements.length > 1) {
                        selectionRectangleG = board.drawSelectionRectangle();
                        PlaitBoard.getActiveHost(board).append(selectionRectangleG!);
                    }
                }
            } catch (error) {
                console.error(error);
            }
        }
        onChange();
    };

    board.afterChange = () => {
        if (isHandleSelection(board) && !hasSetSelectionOperation(board)) {
            try {
                const currentSelectedElements = getSelectedElements(board);
                if (currentSelectedElements.length && currentSelectedElements.length > 1) {
                    selectionRectangleG?.remove();
                    selectionRectangleG = board.drawSelectionRectangle();
                    PlaitBoard.getActiveHost(board).append(selectionRectangleG!);
                } else {
                    selectionRectangleG?.remove();
                }
            } catch (error) {
                console.error(error);
            }
        }
        afterChange();
    };

    setSelectionOptions(board, {
        isMultipleSelection: true,
        isDisabledSelection: false,
        isPreventClearSelection: false
    });

    return board;
}
