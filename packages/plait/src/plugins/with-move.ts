import { BaseCursorStatus, PlaitBoard, PlaitBoardMove, Viewport } from '../interfaces';
import { Transforms } from '../transfroms';
import { transformZoom } from '../utils';

export function withMove<T extends PlaitBoard>(board: T) {
    const { mousedown, mousemove, globalMouseup } = board;

    let plaitBoardMove: PlaitBoardMove = {
        isMoving: false,
        x: 0,
        y: 0
    };

    board.mousedown = (event: MouseEvent) => {
        if (board.cursor === BaseCursorStatus.move && board.selection) {
            plaitBoardMove.isMoving = true;
            plaitBoardMove.x = event.x;
            plaitBoardMove.y = event.y;
        }
        mousedown(event);
    };
    board.mousemove = (event: MouseEvent) => {
        if (board.cursor === BaseCursorStatus.move && board.selection && plaitBoardMove.isMoving) {
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
            plaitBoardMove.isMoving = false;
            plaitBoardMove.x = 0;
            plaitBoardMove.y = 0;
        }
        globalMouseup(event);
    };

    return board;
}
