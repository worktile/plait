import { BaseCursorStatus } from '../interfaces/cursor';
import { PlaitBoard } from '../interfaces/board';
import { Point } from '../interfaces/point';
import { Transforms } from '../transfroms';
import { toPoint } from '../utils/dom';
import { toRectangleClient } from '../utils/graph';

export function withSelection<T extends PlaitBoard>(board: T) {
    const { mousedown, mousemove, mouseup } = board;

    let start: Point | null = null;
    let end: Point | null = null;

    board.mousedown = (event: MouseEvent) => {
        if (board.cursor === BaseCursorStatus.select) {
            start = toPoint(event.x, event.y, board.host);
        }
        mousedown(event);
    };

    board.mousemove = (event: MouseEvent) => {
        const movedTarget = toPoint(event.x, event.y, board.host);
        if (start) {
            const rectangleClient = toRectangleClient([start, movedTarget]);
            if (start && Math.hypot(rectangleClient.width, rectangleClient.height) > 5) {
                end = movedTarget;
            }
        }
        mousemove(event);
    };

    board.mouseup = (event: MouseEvent) => {
        if (start && end) {
        } else if (start) {
            Transforms.setSelection(board, { anchor: start, focus: start });
        }
        start = null;
        end = null;
        mouseup(event);
    };

    return board;
}
