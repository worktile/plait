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
import { PlaitElement, PlaitPointerType, SELECTION_BORDER_COLOR, SELECTION_FILL_COLOR } from '../interfaces';
import { getRectangleByElements } from '../utils/element';
import { BOARD_TO_IS_SELECTION_MOVING, BOARD_TO_TEMPORARY_ELEMENTS } from '../utils/weak-maps';
import { ACTIVE_STROKE_WIDTH, ATTACHED_ELEMENT_CLASS_NAME, SELECTION_RECTANGLE_CLASS_NAME } from '../constants/selection';
import { drawRectangle, isDragging, preventTouchMove, setDragging, throttleRAF, toHostPoint, toViewBoxPoint } from '../utils';
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
        
        const hitElement = getHitElementByPoint(board, point);
        const hitSelectedElements = getHitSelectedElements(board, point);
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
        if (start && PlaitBoard.isPointer(board, PlaitPointerType.selection)) {
            const movedTarget = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
            const rectangle = RectangleClient.toRectangleClient([start, movedTarget]);
            selectionMovingG?.remove();
            if (Math.hypot(rectangle.width, rectangle.height) > PRESS_AND_MOVE_BUFFER || isSelectionMoving(board)) {
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
        pointerMove(event);
    };

    // handle the end of click select
    board.pointerUp = (event: PointerEvent) => {
        const isSetSelectionPointer =
            PlaitBoard.isPointer(board, PlaitPointerType.selection) || PlaitBoard.isPointer(board, PlaitPointerType.hand);
        const isSkip = !isMainPointer(event) || isDragging(board) || !isSetSelectionPointer;
        if (isSkip) {
            pointerDown(event);
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
                    const newSelectedElements = [...elements];
                    cacheSelectedElements(board, newSelectedElements);
                }
                const newElements = getSelectedElements(board);
                previousSelectedElements = newElements;
                deleteTemporaryElements(board);
                if (!isSelectionMoving(board) && newElements.length > 1) {
                    selectionRectangleG = createSelectionRectangleG(board);
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

export function isHandleSelection(board: PlaitBoard) {
    const options = (board as PlaitOptionsBoard).getPluginOptions<WithPluginOptions>(PlaitPluginKey.withSelection);
    return board.pointer !== PlaitPointerType.hand && !options.isDisabledSelect && !PlaitBoard.isReadonly(board);
}

export function isSetSelectionOperation(board: PlaitBoard) {
    return !!board.operations.find(value => value.type === 'set_selection');
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
    setDragging(board, true);
}

export function clearSelectionMoving(board: PlaitBoard) {
    PlaitBoard.getBoardContainer(board).classList.remove('selection-moving');
    BOARD_TO_IS_SELECTION_MOVING.delete(board);
    setDragging(board, false);
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
