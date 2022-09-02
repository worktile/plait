import { PlaitBoard } from '../interfaces/board';
import { Point } from '../interfaces/point';
import { Transforms } from '../transfroms';
import { toPoint } from '../utils/dom';
import { toRectangleClient } from '../utils/graph';
import { isNoSelectionElement } from '../utils/board';

export function withSelection<T extends PlaitBoard>(board: T) {
    const { mousedown, mousemove, globalMouseup } = board;

    let start: Point | null = null;
    let end: Point | null = null;

    board.mousedown = (event: MouseEvent) => {
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

    board.globalMouseup = (event: MouseEvent) => {
        if (isNoSelectionElement(event)) {
            return globalMouseup(event);
        } else {
            if (!start && event.target instanceof Node && board.host.contains(event.target)) {
                start = toPoint(event.x, event.y, board.host);
            }
        }

        if (start) {
            Transforms.setSelection(board, { anchor: start, focus: start });
        } else {
            Transforms.setSelection(board, null);
        }
        start = null;
        end = null;

        globalMouseup(event);
    };

    return board;
}
