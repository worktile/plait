import {
    PRESS_AND_MOVE_BUFFER,
    PlaitBoard,
    PlaitElement,
    PlaitOptionsBoard,
    PlaitPluginKey,
    PlaitPointerType,
    Point,
    RectangleClient,
    SELECTION_BORDER_COLOR,
    SELECTION_FILL_COLOR,
    Transforms,
    WithPluginOptions,
    drawRectangle,
    getHitElementByPoint,
    getHitElementsBySelection,
    getRectangleByElements,
    isDragging,
    isMainPointer,
    isSelectionMoving,
    preventTouchMove,
    setSelectionMoving,
    throttleRAF,
    toHostPoint,
    toViewBoxPoint,
    Selection,
    clearSelectionMoving,
    addSelectedElement,
    clearSelectedElement
} from '@plait/core';
import { getRelatedElements } from '../utils/group';

export function withGroup(board: PlaitBoard) {
    const { pointerDown, pointerMove, pointerUp, globalPointerUp, onChange } = board;
    let isShift = false;
    let isTextSelection = false;
    let selectedElements: PlaitElement[] | null;
    let start: Point | null = null;
    let selection: Selection | null = null;
    let selectionMovingG: SVGGElement;

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
        if (hitElement) {
            if (hitElement.parentId) {
                selectedElements = getRelatedElements(board, [hitElement]);
                selectedElements.forEach(item => {
                    addSelectedElement(board, item);
                });
            }
        } else {
            const options = (board as PlaitOptionsBoard).getPluginOptions<WithPluginOptions>(PlaitPluginKey.withSelection);
            if (PlaitBoard.isPointer(board, PlaitPointerType.selection) && options.isMultiple && !options.isDisabledSelect) {
                preventTouchMove(board, event, true);
                // start rectangle selection
                start = point;
            }
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
            const rectangle = RectangleClient.getRectangleByPoints([start, movedTarget]);
            selectionMovingG?.remove();
            if (Math.hypot(rectangle.width, rectangle.height) > PRESS_AND_MOVE_BUFFER || isSelectionMoving(board)) {
                selection = { anchor: start, focus: movedTarget };
                const hitElements = getHitElementsBySelection(board, selection);
                if (hitElements.length) {
                    const elementsInGroup: PlaitElement[] = [];
                    const elementsOutGroup: PlaitElement[] = [];
                    hitElements.forEach(item => {
                        item.hasOwnProperty('parentId') ? elementsInGroup.push(item) : elementsOutGroup.push(item);
                    });
                    if (elementsInGroup.length) {
                        const relatedElements = getRelatedElements(board, elementsInGroup);
                        const selectedElements = [...relatedElements, ...elementsOutGroup];
                        selectedElements.forEach(item => {
                            addSelectedElement(board, item);
                        });
                        const selectRectangle = getRectangleByElements(board, selectedElements, false);
                        const [newStart, newEnd] = RectangleClient.getPoints(selectRectangle);
                        selection = {
                            anchor: newStart,
                            focus: newEnd
                        };
                    }
                }
                throttleRAF(board, 'with-selection', () => {
                    Transforms.setSelection(board, selection);
                });

                setSelectionMoving(board);
                selectionMovingG = drawRectangle(board, rectangle, {
                    stroke: SELECTION_BORDER_COLOR,
                    strokeWidth: 1,
                    fill: SELECTION_FILL_COLOR,
                    fillStyle: 'solid'
                });
                PlaitBoard.getElementActiveHost(board).append(selectionMovingG);
                return;
            }
        }
        pointerMove(event);
    };

    board.pointerUp = (event: PointerEvent) => {
        if (selectedElements?.length) {
            clearSelectedElement(board);
        }
        const isSetSelectionPointer =
            PlaitBoard.isPointer(board, PlaitPointerType.selection) || PlaitBoard.isPointer(board, PlaitPointerType.hand);
        const isSkip = !isMainPointer(event) || isDragging(board) || !isSetSelectionPointer;
        if (isSkip) {
            pointerUp(event);
            return;
        }
        if (selectedElements?.length) {
            const rectangle = getRectangleByElements(board, selectedElements, false);
            const [start, end] = RectangleClient.getPoints(rectangle);
            selection = { anchor: start, focus: end };
            Transforms.setSelection(board, selection);
        }
        pointerUp(event);
    };

    board.globalPointerUp = (event: PointerEvent) => {
        if (selection) {
            clearSelectionMoving(board);
            selectionMovingG?.remove();
            Transforms.setSelection(board, selection);
        }
        selectedElements = null;
        start = null;
        selection = null;
        isTextSelection = false;
        preventTouchMove(board, event, false);
        globalPointerUp(event);
    };

    return board;
}
