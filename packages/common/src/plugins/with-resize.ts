import {
    MERGING,
    PRESS_AND_MOVE_BUFFER,
    Path,
    PlaitBoard,
    PlaitElement,
    PlaitPointerType,
    Point,
    distanceBetweenPointAndPoint,
    isMainPointer,
    preventTouchMove,
    throttleRAF,
    toPoint,
    transformPoint
} from '@plait/core';
import { ResizeDirection, ResizeCursorClass } from '../constants/resize';
import { addResizing, isResizing, removeResizing } from '../utils/resize';

export interface WithResizeOptions<T extends PlaitElement = PlaitElement> {
    key: string;
    canResize: () => boolean;
    detect: (point: Point) => ResizeDetectResult<T> | null;
    onResize: (resizeRef: ResizeRef<T>, resizeState: ResizeState) => void;
}

export interface ResizeDetectResult<T extends PlaitElement = PlaitElement> {
    element: T;
    direction: ResizeDirection;
    cursorClass: ResizeCursorClass;
}

export interface ResizeRef<T extends PlaitElement = PlaitElement> {
    element: T;
    path: Path;
    direction: ResizeDirection;
}

export interface ResizeState {
    offsetX: number;
    offsetY: number;
}

const generalCanResize = (board: PlaitBoard, event: PointerEvent) => {
    return (
        PlaitBoard.isReadonly(board) ||
        PlaitBoard.hasBeenTextEditing(board) ||
        !PlaitBoard.isPointer(board, PlaitPointerType.hand) ||
        !isMainPointer(event)
    );
};

export const withResize = <T extends PlaitElement = PlaitElement>(board: PlaitBoard, options: WithResizeOptions<T>) => {
    const { pointerDown, pointerMove, globalPointerUp } = board;
    let resizeDetectResult: ResizeDetectResult<T> | null = null;
    let resizeRef: ResizeRef<T> | null = null;
    let startPoint: Point | null = null;
    let hoveDetectResult: ResizeDetectResult<T> | null = null;

    board.pointerDown = (event: PointerEvent) => {
        if (!options.canResize() || !generalCanResize(board, event)) {
            pointerDown(event);
            return;
        }
        const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
        resizeDetectResult = options.detect(point);
        if (resizeDetectResult) {
            PlaitBoard.getBoardContainer(board).classList.add(`${resizeDetectResult.cursorClass}-resize`);
            startPoint = [event.x, event.y];
            resizeRef = {
                path: PlaitBoard.findPath(board, resizeDetectResult.element),
                element: resizeDetectResult.element,
                direction: resizeDetectResult.direction
            };
            return;
        }
        pointerDown(event);
    };

    board.pointerMove = (event: PointerEvent) => {
        if (!options.canResize() || !generalCanResize(board, event)) {
            pointerMove(event);
            return;
        }
        if (startPoint && resizeDetectResult && !isResizing(board)) {
            // prevent text from being selected
            event.preventDefault();
            preventTouchMove(board, true);

            const endPoint = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
            const distance = distanceBetweenPointAndPoint(startPoint[0], startPoint[1], endPoint[0], endPoint[1]);
            if (distance > PRESS_AND_MOVE_BUFFER) {
                addResizing(board, options.key);
                MERGING.set(board, true);
            }
        }

        if (isResizing(board) && startPoint) {
            // prevent text from being selected
            event.preventDefault();
            preventTouchMove(board, true);

            throttleRAF(() => {
                const endPoint = [event.x, event.y];
                if (startPoint && resizeRef) {
                    const offsetX = endPoint[0] - startPoint[0];
                    const offsetY = endPoint[1] - startPoint[1];
                    options.onResize(resizeRef, { offsetX, offsetY });
                }
            });
            return;
        } else {
            const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
            const resizeDetectResult = options.detect(point);
            if (resizeDetectResult) {
                hoveDetectResult = resizeDetectResult;
                PlaitBoard.getBoardContainer(board).classList.add(`${hoveDetectResult.cursorClass}-resize`);
            } else {
                if (hoveDetectResult) {
                    PlaitBoard.getBoardContainer(board).classList.remove(`${hoveDetectResult.cursorClass}-resize`);
                    hoveDetectResult = null;
                }
            }
        }
        pointerMove(event);
    };

    board.globalPointerUp = (event: PointerEvent) => {
        globalPointerUp(event);
        if (isResizing(board) || resizeDetectResult) {
            removeResizing(board, options.key);
            startPoint = null;
            resizeDetectResult = null;
            resizeRef = null;
            MERGING.set(board, false);
            preventTouchMove(board, false);
        }
    };

    return board;
};
