import { PlaitBoard } from '../interfaces/board';
import { Point } from '../interfaces/point';
import { Transforms } from '../transforms';
import { transformPoint } from '../utils/board';
import { isMainPointer, toPoint } from '../utils/dom/common';
import { RectangleClient } from '../interfaces/rectangle-client';
import {
    cacheSelectedElements,
    clearSelectedElement,
    getHitElementByPoint,
    getHitElementsBySelection,
    getSelectedElements,
    removeSelectedElement
} from '../utils/selected-element';
import { PlaitElement, PlaitPointerType, SELECTION_BORDER_COLOR, SELECTION_FILL_COLOR } from '../interfaces';
import { getRectangleByElements } from '../utils/element';
import { BOARD_TO_IS_SELECTION_MOVING, BOARD_TO_TEMPORARY_ELEMENTS } from '../utils/weak-maps';
import { ACTIVE_STROKE_WIDTH, ATTACHED_ELEMENT_CLASS_NAME, SELECTION_RECTANGLE_CLASS_NAME } from '../constants/selection';
import { drawRectangle, preventTouchMove, throttleRAF } from '../utils';
import { PlaitOptionsBoard, PlaitPluginOptions } from './with-options';
import { PlaitPluginKey } from '../interfaces/plugin-key';
import { Selection } from '../interfaces/selection';

export interface WithPluginOptions extends PlaitPluginOptions {
    isMultiple: boolean;
    isDisabledSelect: boolean;
}

export function withSelection(board: PlaitBoard) {
    const { pointerDown, globalPointerMove, globalPointerUp, onChange, keyup } = board;
    let start: Point | null = null;
    let end: Point | null = null;
    let selectionMovingG: SVGGElement;
    let selectionRectangleG: SVGGElement | null;
    let previousSelectedElements: PlaitElement[];
    // prevent text from being selected when user pressed main pointer and is moving
    let needPreventNativeSelectionWhenMoving = false;
    let isShift = false;

    board.pointerDown = (event: PointerEvent) => {
        const isHitText = event.target instanceof Element && event.target.closest('.plait-richtext-container');
        if (event.shiftKey) {
            event.preventDefault();
            isShift = true;
        } else {
            isShift = false;
        }

        if (!isHitText) {
            needPreventNativeSelectionWhenMoving = true;
        }

        if (!isMainPointer(event)) {
            pointerDown(event);
            return;
        }

        const options = (board as PlaitOptionsBoard).getPluginOptions<WithPluginOptions>(PlaitPluginKey.withSelection);
        const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
        const selection = { anchor: point, focus: point };
        const hitElement = getHitElementByPoint(board, point);
        const selectedElements = getSelectedElements(board);

        if (!isShift && hitElement && selectedElements.includes(hitElement) && !options.isDisabledSelect) {
            pointerDown(event);
            return;
        }

        if (PlaitBoard.isPointer(board, PlaitPointerType.selection) && !hitElement && options.isMultiple && !options.isDisabledSelect) {
            selectionRectangleG?.remove();
            start = point;
            preventTouchMove(board, event, true);
        }

        Transforms.setSelection(board, selection);

        pointerDown(event);
    };

    board.keyup = (event: KeyboardEvent) => {
        if (isShift && event.key === 'Shift') {
            isShift = false;
        }
        keyup(event);
    };

    board.globalPointerMove = (event: PointerEvent) => {
        if (needPreventNativeSelectionWhenMoving) {
            // prevent text from being selected
            event.preventDefault();
        }

        if (start && PlaitBoard.isPointer(board, PlaitPointerType.selection)) {
            const movedTarget = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
            const rectangle = RectangleClient.toRectangleClient([start, movedTarget]);
            selectionMovingG?.remove();
            if (Math.hypot(rectangle.width, rectangle.height) > 5) {
                end = movedTarget;
                throttleRAF(() => {
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
        globalPointerMove(event);
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
        needPreventNativeSelectionWhenMoving = false;
        preventTouchMove(board, event, false);
        globalPointerUp(event);
    };

    board.onChange = () => {
        if (PlaitBoard.isReadonly(board)) {
            onChange();
            return;
        }
        const options = (board as PlaitOptionsBoard).getPluginOptions<WithPluginOptions>(PlaitPluginKey.withSelection);
        if (options.isDisabledSelect) {
            clearSelectedElement(board);
        }

        // remove selected element if include
        board.operations.forEach(op => {
            if (op.type === 'remove_node') {
                removeSelectedElement(board, op.node);
            }
        });

        // calc selected elements entry
        if (board.pointer !== PlaitPointerType.hand && !options.isDisabledSelect) {
            const isSetSelection = board.operations.find(value => value.type === 'set_selection');
            try {
                if (isSetSelection) {
                    selectionRectangleG?.remove();
                    const temporaryElements = getTemporaryElements(board);
                    let elements = temporaryElements ? temporaryElements : getHitElementsBySelection(board);
                    if (!options.isMultiple && elements.length > 1) {
                        elements = [elements[0]];
                    }
                    if (isShift && board.selection && Selection.isCollapsed(board.selection)) {
                        const newSelectedElements = [...getSelectedElements(board)];
                        elements.forEach(element => {
                            if (newSelectedElements.includes(element)) {
                                newSelectedElements.splice(newSelectedElements.indexOf(element), 1);
                            } else {
                                newSelectedElements.push(element);
                            }
                        });
                        cacheSelectedElements(board, newSelectedElements);
                    } else {
                        cacheSelectedElements(board, elements);
                    }
                    const newElements = getSelectedElements(board);
                    previousSelectedElements = newElements;
                    deleteTemporaryElements(board);
                    if (!isSelectionMoving(board) && newElements.length > 1) {
                        selectionRectangleG = createSelectionRectangleG(board);
                    }
                } else {
                    const currentSelectedElements = getSelectedElements(board);
                    if (currentSelectedElements.length && currentSelectedElements.length > 1) {
                        if (
                            currentSelectedElements.length !== previousSelectedElements.length ||
                            currentSelectedElements.some((c, index) => c !== previousSelectedElements[index])
                        ) {
                            selectionRectangleG?.remove();
                            selectionRectangleG = createSelectionRectangleG(board);
                            previousSelectedElements = currentSelectedElements;
                        }
                    } else {
                        selectionRectangleG?.remove();
                    }
                }
            } catch (error) {
                console.error(error);
            }
        }
        onChange();
    };

    (board as PlaitOptionsBoard).setPluginOptions<WithPluginOptions>(PlaitPluginKey.withSelection, {
        isMultiple: true,
        isDisabledSelect: false
    });

    return board;
}

export function getTemporaryElements(board: PlaitBoard) {
    const ref = BOARD_TO_TEMPORARY_ELEMENTS.get(board);
    if (ref) {
        return ref.elements;
    } else {
        return undefined;
    }
}

export function getTemporaryRef(board: PlaitBoard) {
    return BOARD_TO_TEMPORARY_ELEMENTS.get(board);
}

export function deleteTemporaryElements(board: PlaitBoard) {
    BOARD_TO_TEMPORARY_ELEMENTS.delete(board);
}

export function isSelectionMoving(board: PlaitBoard) {
    return !!BOARD_TO_IS_SELECTION_MOVING.get(board);
}

export function setSelectionMoving(board: PlaitBoard) {
    PlaitBoard.getBoardContainer(board).classList.add('selection-moving');
    BOARD_TO_IS_SELECTION_MOVING.set(board, true);
}

export function clearSelectionMoving(board: PlaitBoard) {
    PlaitBoard.getBoardContainer(board).classList.remove('selection-moving');
    BOARD_TO_IS_SELECTION_MOVING.delete(board);
}

export function createSelectionRectangleG(board: PlaitBoard) {
    const elements = getSelectedElements(board);
    const rectangle = getRectangleByElements(board, elements, false);
    if (rectangle.width > 0 && rectangle.height > 0 && elements.length > 1) {
        const selectionRectangleG = drawRectangle(board, RectangleClient.inflate(rectangle, ACTIVE_STROKE_WIDTH), {
            stroke: SELECTION_BORDER_COLOR,
            strokeWidth: ACTIVE_STROKE_WIDTH,
            fillStyle: 'solid'
        });
        selectionRectangleG.classList.add(SELECTION_RECTANGLE_CLASS_NAME);
        PlaitBoard.getElementActiveHost(board).append(selectionRectangleG);
        return selectionRectangleG;
    }
    return null;
}
