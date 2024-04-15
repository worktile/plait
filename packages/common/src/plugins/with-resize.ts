import {
    MERGING,
    PRESS_AND_MOVE_BUFFER,
    PlaitBoard,
    PlaitPointerType,
    Point,
    distanceBetweenPointAndPoint,
    isMainPointer,
    preventTouchMove,
    handleTouchTarget,
    throttleRAF,
    toViewBoxPoint,
    toHostPoint,
    isDragging
} from '@plait/core';
import { ResizeHandle } from '../constants/resize';
import { addResizing, isResizing, removeResizing } from '../utils/resize';
import { PlaitElementOrArray, ResizeOptions, ResizeHitTestRef, ResizeRef, WithResizeOptions } from '../types/resize';

const generalCanResize = (board: PlaitBoard, event: PointerEvent) => {
    return (
        !PlaitBoard.isReadonly(board) && !PlaitBoard.hasBeenTextEditing(board) && PlaitBoard.isPointer(board, PlaitPointerType.selection)
    );
};

export const withResize = <T extends PlaitElementOrArray = PlaitElementOrArray, K = ResizeHandle, P = ResizeOptions>(
    board: PlaitBoard,
    options: WithResizeOptions<T, K, P>
) => {
    const { pointerDown, pointerMove, globalPointerUp } = board;
    let resizeHitTestRef: ResizeHitTestRef<T, K, P> | null = null;
    let resizeRef: ResizeRef<T, K, P> | null = null;
    let startPoint: Point | null = null;
    let hoverHitTestRef: ResizeHitTestRef<T, K, P> | null = null;

    board.pointerDown = (event: PointerEvent) => {
        if (!options.canResize() || !generalCanResize(board, event) || !isMainPointer(event)) {
            pointerDown(event);
            return;
        }
        const point = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
        resizeHitTestRef = options.hitTest(point);
        if (resizeHitTestRef) {
            if (resizeHitTestRef.cursorClass) {
                PlaitBoard.getBoardContainer(board).classList.add(`${resizeHitTestRef.cursorClass}`);
            }
            startPoint = [event.x, event.y];
            const path = Array.isArray(resizeHitTestRef.element)
                ? resizeHitTestRef.element.map(el => PlaitBoard.findPath(board, el))
                : PlaitBoard.findPath(board, resizeHitTestRef.element);
            resizeRef = {
                path,
                element: resizeHitTestRef.element,
                handle: resizeHitTestRef.handle,
                handleIndex: resizeHitTestRef.handleIndex,
                rectangle: resizeHitTestRef.rectangle,
                options: resizeHitTestRef.options
            };
            preventTouchMove(board, event, true);
            return;
        }
        pointerDown(event);
    };

    board.pointerMove = (event: PointerEvent) => {
        if (!options.canResize() || !generalCanResize(board, event)) {
            clearHoverHitTestRef();
            pointerMove(event);
            return;
        }
        if (startPoint && resizeHitTestRef && !isResizing(board)) {
            const endPoint = [event.x, event.y];
            const distance = distanceBetweenPointAndPoint(startPoint[0], startPoint[1], endPoint[0], endPoint[1]);
            if (distance > PRESS_AND_MOVE_BUFFER) {
                addResizing(board, resizeRef!, options.key);
                MERGING.set(board, true);
                options.beforeResize && options.beforeResize(resizeRef!);
            }
        }
        if (!isResizing(board) && !isDragging(board)) {
            const point = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
            throttleRAF(board, options.key + '-common-resize-hit-test', () => {
                const hitTestRef = options.hitTest(point);
                if (hitTestRef) {
                    if (hoverHitTestRef && hitTestRef.cursorClass !== hoverHitTestRef.cursorClass) {
                        PlaitBoard.getBoardContainer(board).classList.remove(`${hoverHitTestRef.cursorClass}`);
                    }
                    hoverHitTestRef = hitTestRef;
                    if (hoverHitTestRef.cursorClass) {
                        PlaitBoard.getBoardContainer(board).classList.add(`${hoverHitTestRef.cursorClass}`);
                    }
                } else {
                    clearHoverHitTestRef();
                }
            });
        } else {
            if (startPoint && isResizing(board)) {
                event.preventDefault();
                const endPoint = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
                throttleRAF(board, 'with-common-resize', () => {
                    if (startPoint && resizeRef) {
                        handleTouchTarget(board);
                        options.onResize(resizeRef, {
                            startPoint: toViewBoxPoint(board, toHostPoint(board, startPoint[0], startPoint[1])),
                            endPoint,
                            isShift: !!event.shiftKey
                        });
                    }
                });
                return;
            }
        }
        pointerMove(event);
    };

    board.globalPointerUp = (event: PointerEvent) => {
        globalPointerUp(event);
        if (isResizing(board) || resizeHitTestRef) {
            options.afterResize && options.afterResize(resizeRef!);
            removeResizing(board, options.key);
            startPoint = null;
            resizeHitTestRef = null;
            resizeRef = null;
            MERGING.set(board, false);
            preventTouchMove(board, event, false);
        }
    };

    const clearHoverHitTestRef = () => {
        if (hoverHitTestRef) {
            if (hoverHitTestRef.cursorClass) {
                PlaitBoard.getBoardContainer(board).classList.remove(`${hoverHitTestRef.cursorClass}`);
            }
            hoverHitTestRef = null;
        }
    };

    return board;
};
