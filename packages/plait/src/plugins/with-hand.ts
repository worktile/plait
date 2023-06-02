import { PlaitPointerType, PlaitBoard, PlaitBoardMove } from '../interfaces';
import { BoardTransforms } from '../transforms';
import { isMainPointer } from '../utils/dom/common';
import { updateViewportContainerScroll } from '../utils/viewport';

export function withHandPointer<T extends PlaitBoard>(board: T) {
    const { mousedown, mousemove, globalMouseup, keydown, keyup } = board;
    let isMoving: boolean = false;
    const plaitBoardMove: PlaitBoardMove = {
        x: 0,
        y: 0
    };

    board.mousedown = (event: MouseEvent) => {
        if (PlaitBoard.isPointer(board, PlaitPointerType.hand) && isMainPointer(event)) {
            isMoving = true;
            PlaitBoard.getBoardNativeElement(board).classList.add('viewport-moving');
            plaitBoardMove.x = event.x;
            plaitBoardMove.y = event.y;
        }
        mousedown(event);
    };

    board.mousemove = (event: MouseEvent) => {
        if (PlaitBoard.isPointer(board, PlaitPointerType.hand) && board.selection && isMoving) {
            const viewportContainer = PlaitBoard.getViewportContainer(board);
            const left = viewportContainer.scrollLeft - (event.x - plaitBoardMove.x);
            const top = viewportContainer.scrollTop - (event.y - plaitBoardMove.y);
            updateViewportContainerScroll(board, left, top, false);
            plaitBoardMove.x = event.x;
            plaitBoardMove.y = event.y;
        }
        mousemove(event);
    };

    board.globalMouseup = (event: MouseEvent) => {
        if (board.selection) {
            isMoving = false;
            PlaitBoard.getBoardNativeElement(board).classList.remove('viewport-moving');
            plaitBoardMove.x = 0;
            plaitBoardMove.y = 0;
        }
        globalMouseup(event);
    };

    board.keydown = (event: KeyboardEvent) => {
        if (event.code === 'Space') {
            if (!PlaitBoard.isPointer(board, PlaitPointerType.hand)) {
                BoardTransforms.updatePointerType(board, PlaitPointerType.hand);
            }
            event.preventDefault();
        }
        keydown(event);
    };

    board.keyup = (event: KeyboardEvent) => {
        if (!board.options.readonly && event.code === 'Space') {
            BoardTransforms.updatePointerType(board, PlaitPointerType.selection);
        }
        keyup(event);
    };

    return board;
}
