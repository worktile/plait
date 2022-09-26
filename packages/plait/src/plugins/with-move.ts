import { PlaitBoardComponent } from '../board/board.component';
import { BaseCursorStatus, PlaitBoard, PlaitBoardMove, Viewport } from '../interfaces';
import { Transforms } from '../transfroms';
import { PLAIT_BOARD_TO_COMPONENT, transformZoom, updateCursorStatus } from '../utils';

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
            boardComponent.cdr.detectChanges();
        }
        mousedown(event);
    };

    board.mousemove = (event: MouseEvent) => {
        const boardComponent = PLAIT_BOARD_TO_COMPONENT.get(board) as PlaitBoardComponent;
        if (board.cursor === BaseCursorStatus.move && board.selection && boardComponent.isMoving) {
            const viewport = board?.viewport as Viewport;
            Transforms.setViewport(board, {
                ...viewport,
                offsetX: viewport.offsetX + ((event.x - plaitBoardMove.x) * 100) / transformZoom(board.viewport.zoom),
                offsetY: viewport.offsetY + ((event.y - plaitBoardMove.y) * 100) / transformZoom(board.viewport.zoom)
            });
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
            updateCursorStatus(board, BaseCursorStatus.move);
            const boardComponent = PLAIT_BOARD_TO_COMPONENT.get(board) as PlaitBoardComponent;
            boardComponent.cdr.detectChanges();
            event.preventDefault();
        }
        keydown(event);
    };

    board.keyup = (event: KeyboardEvent) => {
        board.selection && !board.readonly && event.code === 'Space' && updateCursorStatus(board, BaseCursorStatus.select);
        const boardComponent = PLAIT_BOARD_TO_COMPONENT.get(board) as PlaitBoardComponent;
        boardComponent.cdr.detectChanges();
        keyup(event);
    };

    return board;
}
