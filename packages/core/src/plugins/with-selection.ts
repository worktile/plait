import { PlaitBoard } from '../interfaces/board';
import { Point } from '../interfaces/point';
import { Transforms } from '../transforms';
import { isMainPointer } from '../utils/dom/common';
import { RectangleClient } from '../interfaces/rectangle-client';
import {
    cacheSelectedElements,
    clearSelectedElement,
    getHitElementByPoint,
    getHitElementsBySelection,
    getHitSelectedElements,
    getSelectedElements,
    removeSelectedElement
} from '../utils/selected-element';
import { PlaitElement, PlaitGroup, PlaitPointerType, SELECTION_BORDER_COLOR, SELECTION_FILL_COLOR } from '../interfaces';
import { ATTACHED_ELEMENT_CLASS_NAME } from '../constants/selection';
import {
    clearSelectionMoving,
    createSelectionRectangleG,
    deleteTemporaryElements,
    drawRectangle,
    getAllElementsInGroup,
    getElementsInGroupByElement,
    getGroupByElement,
    filterSelectedGroups,
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
    getElementsInGroup,
    uniqueById
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
    const { pointerDown, pointerUp, pointerMove, globalPointerUp, onChange, afterChange } = board;
    let start: Point | null = null;
    let end: Point | null = null;
    let selectionMovingG: SVGGElement;
    let selectionRectangleG: SVGGElement | null;
    let previousSelectedElements: PlaitElement[];
    let isShift = false;
    let isTextSelection = false;

    board.pointerDown = (event: PointerEvent) => {
        if (!isShift && event.shiftKey) {
            isShift = true;
        }
        if (isShift && !event.shiftKey) {
            isShift = false;
        }
        const isHitText = !!(event.target instanceof Element && event.target.closest('.plait-richtext-container'));
        isTextSelection = isHitText && PlaitBoard.hasBeenTextEditing(board);

        // prevent text from being selected
        if (event.shiftKey && !isTextSelection) {
            event.preventDefault();
        }

        const point = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
        const selectedElements = getSelectedElements(board);
        const hitElement = getHitElementByPoint(board, point);
        const hitSelectedElements = selectedElements.length > 1 ? getHitSelectedElements(board, point) : [];
        const isHitTarget = hitElement || hitSelectedElements.length > 0;
        const options = (board as PlaitOptionsBoard).getPluginOptions<WithPluginOptions>(PlaitPluginKey.withSelection);

        if (PlaitBoard.isPointer(board, PlaitPointerType.selection) && !isHitTarget && options.isMultiple && !options.isDisabledSelect) {
            preventTouchMove(board, event, true);
            // start rectangle selection
            start = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
        }

        pointerDown(event);
    };

    board.pointerMove = (event: PointerEvent) => {
        if (!isTextSelection) {
            // prevent text from being selected
            event.preventDefault();
        }
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
        isTextSelection = false;
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
                let elements = temporaryElements ? temporaryElements : getHitElementsBySelection(board);
                if (!options.isMultiple && elements.length > 1) {
                    elements = [elements[0]];
                }
                if (board.selection && Selection.isCollapsed(board.selection) && elements.length > 1) {
                    cacheSelectedElements(board, [...elements]);
                } else {
                    const isHitElementWithGroup = elements.some(item => item.groupId);
                    const selectedElements = getSelectedElements(board);
                    if (isHitElementWithGroup) {
                        if (board.selection && Selection.isCollapsed(board.selection)) {
                            const hitElement = elements[0];
                            const hitElementGroups = getGroupByElement(board, hitElement, true) as PlaitGroup[];
                            if (hitElementGroups.length) {
                                let newElements = [...selectedElements];
                                const elementsInHighestGroup =
                                    getElementsInGroup(board, hitElementGroups[hitElementGroups.length - 1], true) || [];
                                const isSelectGroupElement = selectedElements.some(element =>
                                    elementsInHighestGroup.map(item => item.id).includes(element.id)
                                );
                                if (isShift) {
                                    let pendingElements: PlaitElement[] = [];
                                    if (!isSelectGroupElement) {
                                        pendingElements = elementsInHighestGroup;
                                    } else {
                                        const isHitSelectedElement = selectedElements.some(item => item.id === hitElement.id);
                                        const selectedElementsInGroup = elementsInHighestGroup.filter(item =>
                                            selectedElements.includes(item)
                                        );
                                        if (isHitSelectedElement) {
                                            pendingElements = selectedElementsInGroup.filter(item => item.id !== hitElement.id);
                                        } else {
                                            pendingElements.push(...selectedElementsInGroup, ...elements);
                                        }
                                    }
                                    elementsInHighestGroup.forEach(element => {
                                        if (newElements.includes(element)) {
                                            newElements.splice(newElements.indexOf(element), 1);
                                        }
                                    });
                                    if (pendingElements.length) {
                                        newElements.push(...pendingElements);
                                    }
                                } else {
                                    newElements = [...elements];
                                    const selectedGroups = filterSelectedGroups(board, hitElementGroups);
                                    if (selectedGroups.length > 0) {
                                        if (selectedGroups.length > 1) {
                                            newElements = getAllElementsInGroup(board, selectedGroups[selectedGroups.length - 2], true);
                                        }
                                    } else {
                                        const elementsInGroup = getAllElementsInGroup(
                                            board,
                                            hitElementGroups[hitElementGroups.length - 1],
                                            true
                                        );
                                        if (!isSelectGroupElement) {
                                            newElements = elementsInGroup;
                                        }
                                    }
                                }
                                cacheSelectedElements(board, uniqueById(newElements));
                            }
                        } else {
                            let newElements = [...selectedElements];
                            elements.forEach(item => {
                                if (!item.groupId) {
                                    newElements.push(item);
                                } else {
                                    newElements.push(...getElementsInGroupByElement(board, item));
                                }
                            });
                            cacheSelectedElements(board, uniqueById(newElements));
                        }
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
                        selectionRectangleG = createSelectionRectangleG(board);
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
                        selectionRectangleG = createSelectionRectangleG(board);
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
