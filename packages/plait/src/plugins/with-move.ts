import { PlaitBoardComponent } from '../board/board.component';
import { BaseCursorStatus, PlaitBoard, PlaitBoardMove } from '../interfaces';
import { PLAIT_BOARD_TO_COMPONENT, updateCursorStatus } from '../utils';

export function withMove<T extends PlaitBoard>(board: T) {
    const { mousedown, mousemove, globalMouseup, keydown, keyup } = board;

    const plaitBoardMove: PlaitBoardMove = {
        x: 0,
        y: 0
    };

    board.mousedown = (event: MouseEvent) => {
        if (board.readonly) {
            updateCursorStatus(board, BaseCursorStatus.move);
        } else if (!board.selection) {
            updateCursorStatus(board, BaseCursorStatus.select);
        }
        if (board.cursor === BaseCursorStatus.move && board.selection) {
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
        if (board.cursor === BaseCursorStatus.move && board.selection && boardComponent.isMoving) {
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
            if (board.cursor !== BaseCursorStatus.move) {
                updateCursorStatus(board, BaseCursorStatus.move);
                const boardComponent = PLAIT_BOARD_TO_COMPONENT.get(board) as PlaitBoardComponent;
                boardComponent.cdr.markForCheck();
            }
            event.preventDefault();
        }
        keydown(event);
    };

    board.keyup = (event: KeyboardEvent) => {
        if (board.selection && !board.readonly && event.code === 'Space') {
            updateCursorStatus(board, BaseCursorStatus.select);
            const boardComponent = PLAIT_BOARD_TO_COMPONENT.get(board) as PlaitBoardComponent;
            boardComponent.cdr.markForCheck();
        }
        keyup(event);
    };

    return board;
}
