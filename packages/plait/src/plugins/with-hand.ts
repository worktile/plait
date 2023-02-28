import { PlaitBoardComponent } from '../board/board.component';
import { PlaitPointerType, PlaitBoard, PlaitBoardMove } from '../interfaces';
import { PLAIT_BOARD_TO_COMPONENT, updatePointerType } from '../utils';

export function withHandPointer<T extends PlaitBoard>(board: T) {
    const { mousedown, mousemove, globalMouseup, keydown, keyup } = board;

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
            const boardComponent = PLAIT_BOARD_TO_COMPONENT.get(board) as PlaitBoardComponent;
            boardComponent.movingChange(true);
            plaitBoardMove.x = event.x;
            plaitBoardMove.y = event.y;
            boardComponent.cdr.markForCheck();
        }
        mousedown(event);
    };

    board.mousemove = (event: MouseEvent) => {
        const boardComponent = PLAIT_BOARD_TO_COMPONENT.get(board) as PlaitBoardComponent;
        if (board.pointer === PlaitPointerType.hand && board.selection && boardComponent.isMoving) {
            const left = event.x - plaitBoardMove.x;
            const top = event.y - plaitBoardMove.y;
            boardComponent.setScroll(boardComponent.scrollLeft - left, boardComponent.scrollTop - top);
            plaitBoardMove.x = event.x;
            plaitBoardMove.y = event.y;
        }
        mousemove(event);
    };

    board.globalMouseup = (event: MouseEvent) => {
        if (board.selection) {
            const boardComponent = PLAIT_BOARD_TO_COMPONENT.get(board) as PlaitBoardComponent;
            boardComponent.movingChange(false);
            plaitBoardMove.x = 0;
            plaitBoardMove.y = 0;
        }
        globalMouseup(event);
    };

    board.keydown = (event: KeyboardEvent) => {
        if (board.selection && event.code === 'Space') {
            if (board.pointer !== PlaitPointerType.hand) {
                updatePointerType(board, PlaitPointerType.hand);
                const boardComponent = PLAIT_BOARD_TO_COMPONENT.get(board) as PlaitBoardComponent;
                boardComponent.cdr.markForCheck();
            }
            event.preventDefault();
        }
        keydown(event);
    };

    board.keyup = (event: KeyboardEvent) => {
        if (board.selection && !board.options.readonly && event.code === 'Space') {
            updatePointerType(board, PlaitPointerType.selection);
            const boardComponent = PLAIT_BOARD_TO_COMPONENT.get(board) as PlaitBoardComponent;
            boardComponent.cdr.markForCheck();
        }
        keyup(event);
    };

    return board;
}
