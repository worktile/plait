import { DRAG_SELECTION_PRESS_AND_MOVE_BUFFER } from '../constants';
import { PlaitPointerType, PlaitBoard, PlaitBoardMove, WithHandPluginOptions, PlaitPluginKey } from '../interfaces';
import {
    distanceBetweenPointAndPoint,
    isHitElement,
    isMovingElements,
    isSelectionMoving,
    setSelectionOptions,
    toHostPoint,
    toViewBoxPoint
} from '../utils';
import { isMainPointer, isWheelPointer, isSecondaryPointer } from '../utils/dom/common';
import { isSmartHand } from '../utils/mobile';
import { updateViewportContainerScroll } from '../utils/viewport';
import { PlaitOptionsBoard } from './with-options';

const ShortcutKey = 'Space';
const SECONDARY_POINTER_MOVE_THRESHOLD = 5;

export function withHandPointer<T extends PlaitBoard>(board: T) {
    const { pointerDown, pointerMove, globalPointerUp, keyDown, keyUp, pointerUp } = board;
    let isHandMoving: boolean = false;
    let movingPoint: PlaitBoardMove | null = null;
    let pointerDownEvent: PointerEvent | null = null;
    let hasWheelPressed = false;
    let hasSecondaryPressed = false;
    let beingPressedShortcutKey = false;

    board.pointerDown = (event: PointerEvent) => {
        const options = (board as unknown as PlaitOptionsBoard).getPluginOptions<WithHandPluginOptions>(PlaitPluginKey.withHand);
        const point = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
        const isHitTarget = isHitElement(board, point);
        const canEnterHandMode =
            options?.isHandMode(board, event) ||
            PlaitBoard.isPointer(board, PlaitPointerType.hand) ||
            (isSmartHand(board, event) && !isHitTarget) ||
            beingPressedShortcutKey;
        if (canEnterHandMode && isMainPointer(event)) {
            movingPoint = {
                x: event.x,
                y: event.y
            };
            if (!PlaitBoard.isPointer(board, PlaitPointerType.hand)) {
                PlaitBoard.getBoardContainer(board).classList.add('viewport-moving');
            }
        } else if (isWheelPointer(event)) {
            hasWheelPressed = true;
            event.preventDefault();
            movingPoint = {
                x: event.x,
                y: event.y
            };
            isHandMoving = true;
            PlaitBoard.getBoardContainer(board).classList.add('viewport-moving');
        }
        else if (isSecondaryPointer(event)) {
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
        const triggerDistance = Math.max(DRAG_SELECTION_PRESS_AND_MOVE_BUFFER + 4, SECONDARY_POINTER_MOVE_THRESHOLD);
        
        if (hasSecondaryPressed && movingPoint && !isHandMoving && pointerDownEvent) {
            const distance = distanceBetweenPointAndPoint(
                pointerDownEvent.x, 
                pointerDownEvent.y, 
                event.x, 
                event.y
            );
            if (distance > SECONDARY_POINTER_MOVE_THRESHOLD) {
                isHandMoving = true;
                PlaitBoard.getBoardContainer(board).classList.add('viewport-moving');
            }
        }
        
        if (
            movingPoint &&
            !isHandMoving &&
            !isSelectionMoving(board) &&
            pointerDownEvent &&
            distanceBetweenPointAndPoint(pointerDownEvent.x, pointerDownEvent.y, event.x, event.y) > triggerDistance &&
            !isMovingElements(board)
        ) {
            isHandMoving = true;
            PlaitBoard.getBoardContainer(board).classList.add('viewport-moving');
        }
        
        const canEnterHandMode =
            options?.isHandMode(board, event) ||
            PlaitBoard.isPointer(board, PlaitPointerType.hand) ||
            isSmartHand(board, event) ||
            hasWheelPressed ||
            hasSecondaryPressed ||
            beingPressedShortcutKey;
            
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
        if (isHandMoving) {
            return;
        }
        pointerUp(event);
    };

    board.globalPointerUp = (event: PointerEvent) => {
        if (movingPoint) {
            movingPoint = null;
        }
        isHandMoving = false;
        PlaitBoard.getBoardContainer(board).classList.remove('viewport-moving');
        hasWheelPressed = false;
        hasSecondaryPressed = false;
        globalPointerUp(event);
    };

    board.keyDown = (event: KeyboardEvent) => {
        if (event.code === ShortcutKey) {
            if (!board.options.readonly && !PlaitBoard.isPointer(board, PlaitPointerType.hand)) {
                beingPressedShortcutKey = true;
                setSelectionOptions(board, { isDisabledSelection: true });
                PlaitBoard.getBoardContainer(board).classList.add('viewport-moving');
            }
            event.preventDefault();
        }
        keyDown(event);
    };

    board.keyUp = (event: KeyboardEvent) => {
        if (!board.options.readonly && event.code === ShortcutKey) {
            beingPressedShortcutKey = false;
            setSelectionOptions(board, { isDisabledSelection: false });
            PlaitBoard.getBoardContainer(board).classList.remove('viewport-moving');
        }
        keyUp(event);
    };

    return board;
}
