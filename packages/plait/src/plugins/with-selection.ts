import { PlaitBoard } from '../interfaces/board';
import { Point } from '../interfaces/point';
import { Transforms } from '../transforms';
import { transformPoint } from '../utils/board';
import { toPoint } from '../utils/dom';
import { RectangleClient } from '../interfaces/rectangle-client';
import { cacheselectedElements, calcElementIntersectionSelection } from '../utils/selected-element';

export function withSelection<T extends PlaitBoard>(board: T) {
    const { mousedown, mousemove, mouseup, onChange } = board;

    let start: Point | null = null;
    let end: Point | null = null;

    board.mousedown = (event: MouseEvent) => {
        start = transformPoint(board, toPoint(event.x, event.y, board.host));
        mousedown(event);
    };

    board.mousemove = (event: MouseEvent) => {
        const movedTarget = transformPoint(board, toPoint(event.x, event.y, board.host));
        if (start) {
            const rectangleClient = RectangleClient.toRectangleClient([start, movedTarget]);
            if (Math.hypot(rectangleClient.width, rectangleClient.height) > 5) {
                end = movedTarget;
            }
        }
        mousemove(event);
    };

    board.mouseup = (event: MouseEvent) => {
        if (start && end) {
            Transforms.setSelection(board, { anchor: start, focus: end });
        } else if (start) {
            Transforms.setSelection(board, { anchor: start, focus: start });
        }

        start = null;
        end = null;

        mouseup(event);
    };

    board.onChange = () => {
        // calc selected elements entry
        try {
            if (board.operations.find(value => value.type === 'set_selection')) {
                const elementIds = calcElementIntersectionSelection(board);
                cacheselectedElements(board, elementIds);
            }
        } catch (error) {
            console.error(error);
        }
        onChange();
    };

    return board;
}
