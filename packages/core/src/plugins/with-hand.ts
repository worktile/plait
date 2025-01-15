import { PRESS_AND_MOVE_BUFFER } from '../constants';
import { PlaitPointerType, PlaitBoard, PlaitBoardMove, WithHandPluginOptions, PlaitPluginKey } from '../interfaces';
import { BoardTransforms } from '../transforms';
import { distanceBetweenPointAndPoint, isMovingElements, isSelectionMoving } from '../utils';
import { isMainPointer } from '../utils/dom/common';
import { isSmartHand } from '../utils/mobile';
import { updateViewportContainerScroll } from '../utils/viewport';
import { PlaitOptionsBoard } from './with-options';

export function withHandPointer<T extends PlaitBoard>(board: T) {
    const { pointerDown, pointerMove, globalPointerUp, keyDown, keyUp, pointerUp } = board;
    let isMoving: boolean = false;
    let movingPoint: PlaitBoardMove | null = null;
    let pointerDownEvent: PointerEvent | null = null;

    board.pointerDown = (event: PointerEvent) => {
        const options = (board as unknown as PlaitOptionsBoard).getPluginOptions<WithHandPluginOptions>(PlaitPluginKey.withHand);
        if ((options?.isHandMode(board, event) || isSmartHand(board, event)) && isMainPointer(event)) {
            movingPoint = {
                x: event.x,
                y: event.y
            };
        }
        pointerDownEvent = event;
        pointerDown(event);
    };

    board.pointerMove = (event: PointerEvent) => {
        const options = (board as unknown as PlaitOptionsBoard).getPluginOptions<WithHandPluginOptions>(PlaitPluginKey.withHand);
        if (
            movingPoint &&
            !isMoving &&
            !isSelectionMoving(board) &&
            pointerDownEvent &&
            distanceBetweenPointAndPoint(pointerDownEvent.x, pointerDownEvent.y, event.x, event.y) > PRESS_AND_MOVE_BUFFER + 3 &&
            !isMovingElements(board)
        ) {
            isMoving = true;
            PlaitBoard.getBoardContainer(board).classList.add('viewport-moving');
        }
        if (
            (options?.isHandMode(board, event) ||
                PlaitBoard.isPointer(board, PlaitPointerType.hand) ||
                PlaitBoard.isPointer(board, PlaitPointerType.selection)) &&
            isMoving &&
            movingPoint &&
            !isSelectionMoving(board)
        ) {
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
        if (isMoving) {
            return;
        }
        pointerUp(event);
    };

    board.globalPointerUp = (event: PointerEvent) => {
        if (movingPoint) {
            movingPoint = null;
        }
        if (isMoving) {
            isMoving = false;
            PlaitBoard.getBoardContainer(board).classList.remove('viewport-moving');
        }
        globalPointerUp(event);
    };

    board.keyDown = (event: KeyboardEvent) => {
        if (event.code === 'Space') {
            if (!PlaitBoard.isPointer(board, PlaitPointerType.hand)) {
                BoardTransforms.updatePointerType(board, PlaitPointerType.hand);
            }
            event.preventDefault();
        }
        keyDown(event);
    };

    board.keyUp = (event: KeyboardEvent) => {
        if (!board.options.readonly && event.code === 'Space') {
            BoardTransforms.updatePointerType(board, PlaitPointerType.selection);
        }
        keyUp(event);
    };

    return board;
}
