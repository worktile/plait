import { PlaitBoard } from '../interfaces/board';
import { Point } from '../interfaces/point';
import { Transforms } from '../transforms';
import { transformPoint } from '../utils/board';
import { toPoint } from '../utils/dom';
import { RectangleClient } from '../interfaces/rectangle-client';
import {
    cacheSelectedElements,
    calcElementIntersectionSelection,
    getSelectedElements,
    isIntersectionElements
} from '../utils/selected-element';
import { PlaitElement, PlaitPointerType, SELECTION_BORDER_COLOR, SELECTION_FILL_COLOR } from '../interfaces';
import { getRectangleByElements } from '../utils/element';
import { BOARD_TO_IS_SELECTION_MOVING, BOARD_TO_TEMPORARY_ELEMENTS } from '../utils/weak-maps';
import { ATTACHED_ELEMENT_CLASS_NAME } from '../constants/selection';

export function withSelection(board: PlaitBoard) {
    const { mousedown, globalMousemove, globalMouseup, onChange } = board;

    let start: Point | null = null;
    let end: Point | null = null;
    let selectionMovingG: SVGGElement;
    let selectionOuterG: SVGGElement;
    let previousSelectedElements: PlaitElement[];

    board.mousedown = (event: MouseEvent) => {
        if (event.button === 0) {
            start = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
        }

        if (start) {
            const ranges = [{ anchor: start, focus: start }];
            const selectedElements = getSelectedElements(board);

            if (isIntersectionElements(board, selectedElements, ranges)) {
                start = null;
                mousedown(event);
                return;
            }

            Transforms.setSelection(board, { ranges: ranges });

            if (calcElementIntersectionSelection(board).length || board.pointer === PlaitPointerType.hand) {
                start = null;
            }
        }

        mousedown(event);
    };

    board.globalMousemove = (event: MouseEvent) => {
        if (start) {
            const movedTarget = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
            const { x, y, width, height } = RectangleClient.toRectangleClient([start, movedTarget]);
            selectionMovingG?.remove();
            if (Math.hypot(width, height) > 5) {
                end = movedTarget;
                Transforms.setSelection(board, { ranges: [{ anchor: start, focus: end }] });
                setSelectionMoving(board);
                const rough = PlaitBoard.getRoughSVG(board);
                selectionMovingG = rough.rectangle(x, y, width, height, {
                    stroke: SELECTION_BORDER_COLOR,
                    strokeWidth: 1,
                    fill: SELECTION_FILL_COLOR,
                    fillStyle: 'solid'
                });
                PlaitBoard.getHost(board).append(selectionMovingG);
            }
        }
        globalMousemove(event);
    };

    board.globalMouseup = (event: MouseEvent) => {
        if (start && end) {
            selectionMovingG?.remove();
            clearSelectionMoving(board);
            Transforms.setSelection(board, { ranges: [{ anchor: start, focus: end }] });
        }

        if (PlaitBoard.isFocus(board)) {
            const isInBoard = event.target instanceof Node && PlaitBoard.getBoardNativeElement(board).contains(event.target);
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
        globalMouseup(event);
    };

    board.onChange = () => {
        // calc selected elements entry
        if (board.pointer !== PlaitPointerType.hand) {
            try {
                if (board.operations.find(value => value.type === 'set_selection')) {
                    selectionOuterG?.remove();
                    const temporaryElements = getTemporaryElements(board);
                    const elements = temporaryElements ? temporaryElements : calcElementIntersectionSelection(board);
                    cacheSelectedElements(board, elements);
                    previousSelectedElements = elements;
                    const { width, height } = getRectangleByElements(board, elements, false);
                    if (width > 0 && height > 0 && elements.length > 1) {
                        selectionOuterG = createSelectionOuterG(board, elements);
                        selectionOuterG.classList.add('selection-outer');
                        PlaitBoard.getHost(board).append(selectionOuterG);
                    }
                    deleteTemporaryElements(board);
                } else {
                    // wait node destroy and remove selected element state
                    setTimeout(() => {
                        const currentSelectedElements = getSelectedElements(board);
                        if (currentSelectedElements.length && currentSelectedElements.length > 1) {
                            const selectedElementChange = currentSelectedElements.some(item => !previousSelectedElements.includes(item));
                            if (selectedElementChange) {
                                selectionOuterG?.remove();
                                selectionOuterG = createSelectionOuterG(board, currentSelectedElements);
                                selectionOuterG.classList.add('selection-outer');
                                PlaitBoard.getHost(board).append(selectionOuterG);
                            }
                        } else {
                            selectionOuterG?.remove();
                        }
                    });
                }
            } catch (error) {
                console.error(error);
            }
        }
        onChange();
    };

    return board;
}

export function getTemporaryElements(board: PlaitBoard) {
    return BOARD_TO_TEMPORARY_ELEMENTS.get(board);
}

export function deleteTemporaryElements(board: PlaitBoard) {
    BOARD_TO_TEMPORARY_ELEMENTS.delete(board);
}

export function isSelectionMoving(board: PlaitBoard) {
    return !!BOARD_TO_IS_SELECTION_MOVING.get(board);
}

export function setSelectionMoving(board: PlaitBoard) {
    PlaitBoard.getBoardNativeElement(board).classList.add('selection-moving');
    BOARD_TO_IS_SELECTION_MOVING.set(board, true);
}

export function clearSelectionMoving(board: PlaitBoard) {
    PlaitBoard.getBoardNativeElement(board).classList.remove('selection-moving');
    BOARD_TO_IS_SELECTION_MOVING.delete(board);
}

export function createSelectionOuterG(board: PlaitBoard, selectElements: PlaitElement[]) {
    const { x, y, width, height } = getRectangleByElements(board, selectElements, false);
    const rough = PlaitBoard.getRoughSVG(board);
    return rough.rectangle(x - 2.5, y - 2.5, width + 5, height + 5, {
        stroke: SELECTION_BORDER_COLOR,
        strokeWidth: 1,
        fillStyle: 'solid'
    });
}
