import {
    MERGING,
    PRESS_AND_MOVE_BUFFER,
    PlaitBoard,
    PlaitElement,
    PlaitPointerType,
    Point,
    distanceBetweenPointAndPoint,
    isMainPointer,
    preventTouchMove,
    handleTouchTarget,
    throttleRAF,
    ResizeCursorClass,
    toViewBoxPoint,
    toHostPoint,
    RectangleClient
} from '@plait/core';
import { ResizeHandle } from '../constants/resize';
import { ResizeRef, addResizing, isResizing, removeResizing } from '../utils/resize';

export interface WithResizeOptions<T extends PlaitElement = PlaitElement, K = ResizeHandle> {
    key: string;
    canResize: () => boolean;
    detect: (point: Point) => ResizeDetectResult<T, K> | null;
    onResize: (resizeRef: ResizeRef<T, K>, resizeState: ResizeState) => void;
    afterResize?: (resizeRef: ResizeRef<T, K>) => void;
    beforeResize?: (resizeRef: ResizeRef<T, K>) => void;
}

export interface ResizeDetectResult<T extends PlaitElement = PlaitElement, K = ResizeHandle> {
    element: T;
    elements?: T[];
    rectangle?: RectangleClient;
    handle: K;
    cursorClass?: ResizeCursorClass;
}

export interface ResizeState {
    startPoint: Point;
    endPoint: Point;
}

const generalCanResize = (board: PlaitBoard, event: PointerEvent) => {
    return (
        !PlaitBoard.isReadonly(board) && !PlaitBoard.hasBeenTextEditing(board) && PlaitBoard.isPointer(board, PlaitPointerType.selection)
    );
};

export const withResize = <T extends PlaitElement = PlaitElement, K = ResizeHandle>(
    board: PlaitBoard,
    options: WithResizeOptions<T, K>
) => {
    const { pointerDown, pointerMove, globalPointerUp } = board;
    let resizeDetectResult: ResizeDetectResult<T, K> | null = null;
    let resizeRef: ResizeRef<T, K> | null = null;
    let startPoint: Point | null = null;
    let hoveDetectResult: ResizeDetectResult<T, K> | null = null;

    board.pointerDown = (event: PointerEvent) => {
        if (!options.canResize() || !generalCanResize(board, event) || !isMainPointer(event)) {
            pointerDown(event);
            return;
        }
        const point = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
        resizeDetectResult = options.detect(point);
        if (resizeDetectResult) {
            if (resizeDetectResult.cursorClass) {
                PlaitBoard.getBoardContainer(board).classList.add(`${resizeDetectResult.cursorClass}`);
            }
            startPoint = [event.x, event.y];
            resizeRef = {
                path: PlaitBoard.findPath(board, resizeDetectResult.element),
                element: resizeDetectResult.element,
                elements: resizeDetectResult.elements,
                handle: resizeDetectResult.handle,
                rectangle: resizeDetectResult.rectangle
            };
            preventTouchMove(board, event, true);
            // prevent text from being selected when user pressed shift and pointer down
            event.preventDefault();
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
            const endPoint = [event.x, event.y];
            const distance = distanceBetweenPointAndPoint(startPoint[0], startPoint[1], endPoint[0], endPoint[1]);
            if (distance > PRESS_AND_MOVE_BUFFER) {
                addResizing(board, resizeRef!, options.key);
                MERGING.set(board, true);
                options.beforeResize && options.beforeResize(resizeRef!);
            }
        }

        if (isResizing(board) && startPoint) {
            // prevent text from being selected
            event.preventDefault();
            const endPoint = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
            throttleRAF(() => {
                if (startPoint && resizeRef) {
                    handleTouchTarget(board);
                    options.onResize(resizeRef, {
                        startPoint: toViewBoxPoint(board, toHostPoint(board, startPoint[0], startPoint[1])),
                        endPoint
                    });
                }
            });
            return;
        } else {
            const point = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
            const resizeDetectResult = options.detect(point);
            if (resizeDetectResult) {
                if (hoveDetectResult && resizeDetectResult.cursorClass !== hoveDetectResult.cursorClass) {
                    PlaitBoard.getBoardContainer(board).classList.remove(`${hoveDetectResult.cursorClass}`);
                }
                hoveDetectResult = resizeDetectResult;
                if (hoveDetectResult.cursorClass) {
                    PlaitBoard.getBoardContainer(board).classList.add(`${hoveDetectResult.cursorClass}`);
                }
            } else {
                if (hoveDetectResult) {
                    if (hoveDetectResult.cursorClass) {
                        PlaitBoard.getBoardContainer(board).classList.remove(`${hoveDetectResult.cursorClass}`);
                    }
                    hoveDetectResult = null;
                }
            }
        }
        pointerMove(event);
    };

    board.globalPointerUp = (event: PointerEvent) => {
        globalPointerUp(event);
        if (isResizing(board) || resizeDetectResult) {
            options.beforeResize && options.beforeResize(resizeRef!);
            removeResizing(board, options.key);
            startPoint = null;
            resizeDetectResult = null;
            resizeRef = null;
            MERGING.set(board, false);
            preventTouchMove(board, event, false);
        }
    };

    return board;
};
