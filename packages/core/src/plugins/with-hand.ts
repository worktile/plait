import { DRAG_SELECTION_PRESS_AND_MOVE_BUFFER } from '../constants';
import { PlaitPointerType, PlaitBoard, PlaitBoardMove, WithHandPluginOptions, PlaitPluginKey } from '../interfaces';
import {
    BOARD_TO_TEMPORARY_POINTER,
    distanceBetweenPointAndPoint,
    isMovingElements,
    isSelectionMoving,
    toHostPoint,
    toViewBoxPoint
} from '../utils';
import { isMainPointer, isWheelPointer, isSecondaryPointer } from '../utils/dom/common';
import { updateViewportContainerScroll } from '../utils/viewport';
import { PlaitOptionsBoard } from './with-options';

const ShortcutKey = 'Space';
const SECONDARY_POINTER_MOVE_THRESHOLD = 5;

export const IS_HAND_MODE = new WeakMap<PlaitBoard, boolean>();

export const isHandMode = (board: PlaitBoard) => {
    return IS_HAND_MODE.get(board) || false;
};

export function withHandPointer<T extends PlaitBoard>(board: T) {
    const { pointerDown, pointerMove, pointerCancel, globalPointerUp, keyDown, keyUp, pointerUp } = board;
    let isHandMoving: boolean = false;
    let movingPoint: PlaitBoardMove | null = null;
    let pointerDownEvent: PointerEvent | null = null;
    let hasWheelPressed = false;
    let hasSecondaryPressed = false;
    let isShortcutKeyPressed = false;
    let isSpaceHandGestureActive = false;
    let isMainPointerPressed = false;

    board.pointerDown = (event: PointerEvent) => {
        if (isMainPointer(event)) {
            isMainPointerPressed = true;
        }
        const options = (board as unknown as PlaitOptionsBoard).getPluginOptions<WithHandPluginOptions>(PlaitPluginKey.withHand);
        const canEnterHandMode = options?.isHandMode(board, event) || PlaitBoard.isPointer(board, PlaitPointerType.hand);
        if (canEnterHandMode && isMainPointer(event)) {
            isSpaceHandGestureActive = BOARD_TO_TEMPORARY_POINTER.has(board);
            movingPoint = {
                x: event.x,
                y: event.y
            };
            if (board.pointer !== PlaitPointerType.hand) {
                PlaitBoard.getBoardContainer(board).classList.add('viewport-moving');
            }
        } else if (isWheelPointer(event)) {
            hasWheelPressed = true;
            event.preventDefault();
            movingPoint = {
                x: event.x,
                y: event.y
            };
            enterHandMode();
        } else if (isSecondaryPointer(event)) {
            hasSecondaryPressed = true;
            movingPoint = {
                x: event.x,
                y: event.y
            };
            pointerDownEvent = event;
        }
        pointerDownEvent = event;
        pointerDown(event);
    };

    board.pointerMove = (event: PointerEvent) => {
        const options = (board as unknown as PlaitOptionsBoard).getPluginOptions<WithHandPluginOptions>(PlaitPluginKey.withHand);
        const triggerDistance = DRAG_SELECTION_PRESS_AND_MOVE_BUFFER + 4;
        const canEnterHandMode =
            options?.isHandMode(board, event) ||
            PlaitBoard.isPointer(board, PlaitPointerType.hand) ||
            hasWheelPressed ||
            hasSecondaryPressed;

        if (hasSecondaryPressed && movingPoint && !isHandMoving && pointerDownEvent) {
            const distance = distanceBetweenPointAndPoint(pointerDownEvent.x, pointerDownEvent.y, event.x, event.y);
            if (distance > SECONDARY_POINTER_MOVE_THRESHOLD) {
                enterHandMode();
            }
        }

        if (
            movingPoint &&
            !isHandMoving &&
            canEnterHandMode &&
            !isSelectionMoving(board) &&
            pointerDownEvent &&
            distanceBetweenPointAndPoint(pointerDownEvent.x, pointerDownEvent.y, event.x, event.y) > triggerDistance &&
            !isMovingElements(board)
        ) {
            enterHandMode();
        }

        if (canEnterHandMode && isHandMoving && movingPoint && !isSelectionMoving(board) && !isMovingElements(board)) {
            const viewportContainer = PlaitBoard.getViewportContainer(board);
            const left = viewportContainer.scrollLeft - (event.x - movingPoint.x);
            const top = viewportContainer.scrollTop - (event.y - movingPoint.y);
            updateViewportContainerScroll(board, left, top, false);
            movingPoint.x = event.x;
            movingPoint.y = event.y;
        }
        pointerMove(event);
    };

    board.pointerUp = (event: PointerEvent) => {
        isMainPointerPressed = false;
        if (isHandMoving || isSpaceHandGestureActive) {
            return;
        }
        pointerUp(event);
    };

    board.globalPointerUp = (event: PointerEvent) => {
        finishHandGesture();
        globalPointerUp(event);
        clearTemporaryHandIfIdle();
    };

    board.pointerCancel = (event: PointerEvent) => {
        pointerCancel(event);
        finishHandGesture();
        clearTemporaryHandIfIdle();
    };

    board.keyDown = (event: KeyboardEvent) => {
        if (event.code === ShortcutKey) {
            if (!board.options.readonly && !isMainPointerPressed && board.pointer !== PlaitPointerType.hand) {
                isShortcutKeyPressed = true;
                BOARD_TO_TEMPORARY_POINTER.set(board, PlaitPointerType.hand);
                PlaitBoard.getBoardContainer(board).classList.add('viewport-moving');
            }
            event.preventDefault();
        }
        keyDown(event);
    };

    board.keyUp = (event: KeyboardEvent) => {
        if (event.code === ShortcutKey) {
            isShortcutKeyPressed = false;
            clearTemporaryHandIfIdle();
        }
        keyUp(event);
    };

    const enterHandMode = () => {
        isHandMoving = true;
        PlaitBoard.getBoardContainer(board).classList.add('viewport-moving');
        IS_HAND_MODE.set(board, true);
    };

    const exitHandMode = () => {
        isHandMoving = false;
        PlaitBoard.getBoardContainer(board).classList.remove('viewport-moving');
        setTimeout(() => {
            IS_HAND_MODE.set(board, false);
        }, 0);
    };

    const finishHandGesture = () => {
        isMainPointerPressed = false;
        movingPoint = null;
        exitHandMode();
        hasWheelPressed = false;
        hasSecondaryPressed = false;
        isSpaceHandGestureActive = false;
    };

    const clearTemporaryHandIfIdle = () => {
        if (!isShortcutKeyPressed && !isSpaceHandGestureActive) {
            BOARD_TO_TEMPORARY_POINTER.delete(board);
            PlaitBoard.getBoardContainer(board).classList.remove('viewport-moving');
        }
    };

    return board;
}
