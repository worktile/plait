import { PlaitPointerType, PlaitBoard, PlaitBoardMove, Point } from '../interfaces';
import { updatePointerType } from '../transforms/board';
import { updateViewportContainerScroll } from '../utils/viewport';

export function withHandPointer<T extends PlaitBoard>(board: T) {
    const { mousedown, mousemove, globalMouseup, keydown, keyup } = board;

    let isMoving: boolean = false;
    const plaitBoardMove: PlaitBoardMove = {
        x: 0,
        y: 0
    };

    board.mousedown = (event: MouseEvent) => {
        if (board.options.readonly) {
            updatePointerType(board, PlaitPointerType.hand);
        } else if (!board.selection) {
            updatePointerType(board, PlaitPointerType.selection);
        }
        if (board.pointer === PlaitPointerType.hand && board.selection) {
            isMoving = true;
            PlaitBoard.getBoardNativeElement(board).classList.add('viewport-moving');
            plaitBoardMove.x = event.x;
            plaitBoardMove.y = event.y;
        }
        mousedown(event);
    };

    board.mousemove = (event: MouseEvent) => {
        if (board.pointer === PlaitPointerType.hand && board.selection && isMoving) {
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
        if (board.selection && event.code === 'Space') {
            if (board.pointer !== PlaitPointerType.hand) {
                updatePointerType(board, PlaitPointerType.hand);
            }
            event.preventDefault();
        }
        keydown(event);
    };

    board.keyup = (event: KeyboardEvent) => {
        if (board.selection && !board.options.readonly && event.code === 'Space') {
            updatePointerType(board, PlaitPointerType.selection);
        }
        keyup(event);
    };

    return board;
}
