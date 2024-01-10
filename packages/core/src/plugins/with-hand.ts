import { PlaitPointerType, PlaitBoard, PlaitBoardMove } from '../interfaces';
import { BoardTransforms } from '../transforms';
import { isMainPointer } from '../utils/dom/common';
import { updateViewportContainerScroll } from '../utils/viewport';

export function withHandPointer<T extends PlaitBoard>(board: T) {
    const { pointerDown, pointerMove, globalPointerUp, keyDown, keyUp } = board;
    let isMoving: boolean = false;
    const plaitBoardMove: PlaitBoardMove = {
        x: 0,
        y: 0
    };

    board.pointerDown = (event: PointerEvent) => {
        if (PlaitBoard.isPointer(board, PlaitPointerType.hand) && isMainPointer(event)) {
            isMoving = true;
            PlaitBoard.getBoardContainer(board).classList.add('viewport-moving');
            plaitBoardMove.x = event.x;
            plaitBoardMove.y = event.y;
        }
        pointerDown(event);
    };

    board.pointerMove = (event: PointerEvent) => {
        if (PlaitBoard.isPointer(board, PlaitPointerType.hand) && isMoving) {
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
