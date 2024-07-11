import { PlaitPointerType, PlaitBoard, PlaitBoardMove, WithHandPluginOptions, PlaitPluginKey } from '../interfaces';
import { BoardTransforms } from '../transforms';
import { isMainPointer } from '../utils/dom/common';
import { updateViewportContainerScroll } from '../utils/viewport';
import { PlaitOptionsBoard } from './with-options';

export function withHandPointer<T extends PlaitBoard>(board: T) {
    const { pointerDown, pointerMove, globalPointerUp, keyDown, keyUp } = board;
    let isMoving: boolean = false;
    const plaitBoardMove: PlaitBoardMove = {
        x: 0,
        y: 0
    };

    board.pointerDown = (event: PointerEvent) => {
        const options = ((board as unknown) as PlaitOptionsBoard).getPluginOptions<WithHandPluginOptions>(PlaitPluginKey.withHand);
        if ((options.isHandMode(board, event) || PlaitBoard.isPointer(board, PlaitPointerType.hand)) && isMainPointer(event)) {
            isMoving = true;
            plaitBoardMove.x = event.x;
            plaitBoardMove.y = event.y;
        }
        pointerDown(event);
    };

    board.pointerMove = (event: PointerEvent) => {
        const options = ((board as unknown) as PlaitOptionsBoard).getPluginOptions<WithHandPluginOptions>(PlaitPluginKey.withHand);
        if ((options.isHandMode(board, event) || PlaitBoard.isPointer(board, PlaitPointerType.hand)) && isMoving) {
            PlaitBoard.getBoardContainer(board).classList.add('viewport-moving');
            const viewportContainer = PlaitBoard.getViewportContainer(board);
            const left = viewportContainer.scrollLeft - (event.x - plaitBoardMove.x);
            const top = viewportContainer.scrollTop - (event.y - plaitBoardMove.y);
            updateViewportContainerScroll(board, left, top, false);
            plaitBoardMove.x = event.x;
            plaitBoardMove.y = event.y;
        }
        pointerMove(event);
    };

    board.globalPointerUp = (event: PointerEvent) => {
        if (isMoving) {
            isMoving = false;
            PlaitBoard.getBoardContainer(board).classList.remove('viewport-moving');
            plaitBoardMove.x = 0;
            plaitBoardMove.y = 0;
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
