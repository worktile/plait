import { DRAG_SELECTION_PRESS_AND_MOVE_BUFFER } from '../constants';
import { PlaitPointerType, PlaitBoard, PlaitBoardMove, WithHandPluginOptions, PlaitPluginKey } from '../interfaces';
import { distanceBetweenPointAndPoint, isHitElement, isMovingElements, isSelectionMoving, toHostPoint, toViewBoxPoint } from '../utils';
import { isMainPointer, isWheelPointer } from '../utils/dom/common';
import { isSmartHand } from '../utils/mobile';
import { updateViewportContainerScroll } from '../utils/viewport';
import { PlaitOptionsBoard } from './with-options';

const ShortcutKey = 'Space';

export function withHandPointer<T extends PlaitBoard>(board: T) {
    const { pointerDown, pointerMove, globalPointerUp, keyDown, keyUp, pointerUp } = board;
    let isHandMoving: boolean = false;
    let movingPoint: PlaitBoardMove | null = null;
    let pointerDownEvent: PointerEvent | null = null;
    let hasWheelPressed = false;
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
            // Prevent the browser's default behavior of scrolling the page when the mouse wheel is pressed.
            event.preventDefault();
            movingPoint = {
                x: event.x,
                y: event.y
            };
            isHandMoving = true;
            PlaitBoard.getBoardContainer(board).classList.add('viewport-moving');
        }
        pointerDownEvent = event;
        pointerDown(event);
    };

    board.pointerMove = (event: PointerEvent) => {
        const options = (board as unknown as PlaitOptionsBoard).getPluginOptions<WithHandPluginOptions>(PlaitPluginKey.withHand);
        // 阈值必须大于 withSelection 中 pointerMove 的 PRESS_AND_MOVE_BUFFER：
        // 1. 首先检测是否满足进入拖选状态的条件
        // 2. 仅当不满足拖选条件时，才会考虑触发 withHand 行为
        // Must exceed the DRAG_SELECTION_PRESS_AND_MOVE_BUFFER threshold defined in withSelection's pointerMove.
        // The system first checks for drag selection state eligibility
        // withHand behavior is only triggered if drag selection state is not initiated.
        const triggerDistance = DRAG_SELECTION_PRESS_AND_MOVE_BUFFER + 4;
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
        globalPointerUp(event);
    };

    board.keyDown = (event: KeyboardEvent) => {
        if (event.code === ShortcutKey) {
            if (!PlaitBoard.isPointer(board, PlaitPointerType.hand)) {
                beingPressedShortcutKey = true;
                PlaitBoard.getBoardContainer(board).classList.add('viewport-moving');
            }
            event.preventDefault();
        }
        keyDown(event);
    };

    board.keyUp = (event: KeyboardEvent) => {
        if (!board.options.readonly && event.code === ShortcutKey) {
            beingPressedShortcutKey = true;
            PlaitBoard.getBoardContainer(board).classList.remove('viewport-moving');
        }
        keyUp(event);
    };

    return board;
}
