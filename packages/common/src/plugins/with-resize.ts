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
    getRectangleByElements,
    PlaitElement,
    RectangleClient,
    AlignReaction,
    ACTIVE_MOVING_CLASS_NAME
} from '@plait/core';
import { ResizeHandle } from '../constants/resize';
import { addResizing, getActiveRectangle, getHandleDirections, isResizing, removeResizing } from '../utils/resize';
import { PlaitElementOrArray, ResizeHitTestRef, ResizeRef, WithResizeOptions } from '../types/resize';

const generalCanResize = (board: PlaitBoard, event: PointerEvent) => {
    return (
        !PlaitBoard.isReadonly(board) && !PlaitBoard.hasBeenTextEditing(board) && PlaitBoard.isPointer(board, PlaitPointerType.selection)
    );
};

export const withResize = <T extends PlaitElementOrArray = PlaitElementOrArray, K = ResizeHandle>(
    board: PlaitBoard,
    options: WithResizeOptions<T, K>
) => {
    const { pointerDown, pointerMove, globalPointerUp } = board;
    let resizeHitTestRef: ResizeHitTestRef<T, K> | null = null;
    let resizeRef: ResizeRef<T, K> | null = null;
    let startPoint: Point | null = null;
    let hoverHitTestRef: ResizeHitTestRef<T, K> | null = null;
    let activeElementsRectangle: RectangleClient | null = null;
    let offsetX = 0;
    let offsetY = 0;
    let alignG: SVGGElement | null = null;
    let resizeElements: PlaitElement[] | null = null;

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
                rectangle: resizeHitTestRef.rectangle
            };
            preventTouchMove(board, event, true);
            resizeElements = [resizeRef.element] as PlaitElement[];
            if(Array.isArray(resizeRef.element)){
                resizeElements = resizeRef.element;
            }
            activeElementsRectangle = getRectangleByElements(board, resizeElements, true);
            // prevent text from being selected when user pressed shift and pointer down
            event.preventDefault();
            return;
        }
        pointerDown(event);
    };

    board.pointerMove = (event: PointerEvent) => {
        alignG?.remove();
        if (!options.canResize() || !generalCanResize(board, event)) {
            pointerMove(event);
            return;
        }
        if (startPoint && resizeHitTestRef && !isResizing(board)) {
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
                    if (!activeElementsRectangle) {
                        return;
                    }
                    const [startPointX, startPointY] = toViewBoxPoint(board, toHostPoint(board, startPoint[0], startPoint[1]));
                    offsetX = endPoint[0] - startPointX;
                    offsetY = endPoint[1] - startPointY;
                    const newRectangle = getActiveRectangle<K>(resizeRef.handle, activeElementsRectangle, offsetX, offsetY);
                    const reactionManager = new AlignReaction(board, resizeElements!, newRectangle);
                    const directions = getHandleDirections(resizeRef.handle as ResizeHandle);
                    const { deltaX, deltaY, g } = reactionManager.handleAlign('resize', directions);
                    alignG = g;
                    alignG.classList.add(ACTIVE_MOVING_CLASS_NAME);
                    PlaitBoard.getElementActiveHost(board).append(alignG);
                    options.onResize(resizeRef, {
                        startPoint: [startPointX, startPointY],
                        endPoint: [endPoint[0] - deltaX, endPoint[1] - deltaY],
                        isShift: !!event.shiftKey
                    });
                }
            });
            return;
        } else {
            const point = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
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
                if (hoverHitTestRef) {
                    if (hoverHitTestRef.cursorClass) {
                        PlaitBoard.getBoardContainer(board).classList.remove(`${hoverHitTestRef.cursorClass}`);
                    }
                    hoverHitTestRef = null;
                }
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
            offsetX = 0;
            offsetY = 0;
            resizeElements = null;
            alignG?.remove();
            alignG = null;
            MERGING.set(board, false);
            preventTouchMove(board, event, false);
        }
    };

    return board;
};
