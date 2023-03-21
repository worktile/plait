import { PlaitBoard } from '../interfaces/board';
import { Point } from '../interfaces/point';
import { Transforms } from '../transforms';
import { transformPoint } from '../utils/board';
import { toPoint } from '../utils/dom';
import { RectangleClient } from '../interfaces/rectangle-client';
import { cacheSelectedElements, calcElementIntersectionSelection } from '../utils/selected-element';
import { SELECTION_BORDER_COLOR, SELECTION_FILL_COLOR } from '../interfaces';

export function withSelection<T extends PlaitBoard>(board: T) {
    const { mousedown, mousemove, mouseup, onChange } = board;

    let start: Point | null = null;
    let end: Point | null = null;
    let selectionMovingG: SVGGElement;

    board.mousedown = (event: MouseEvent) => {
        start = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
        mousedown(event);
    };

    board.mousemove = (event: MouseEvent) => {
        const movedTarget = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
        if (start) {
            const { x, y, width, height } = RectangleClient.toRectangleClient([start, movedTarget]);
            if (Math.hypot(width, height) > 5) {
                end = movedTarget;
                selectionMovingG?.remove();
                const rough = PlaitBoard.getRoughSVG(board);
                selectionMovingG = rough.rectangle(x, y, width, height, {
                    stroke: SELECTION_BORDER_COLOR,
                    strokeWidth: 1,
                    fill: SELECTION_FILL_COLOR,
                    fillStyle: 'solid'
                });
                PlaitBoard.getHost(board).append(selectionMovingG);
            }
        }
        mousemove(event);
    };

    board.mouseup = (event: MouseEvent) => {
        if (start && end) {
            selectionMovingG?.remove();
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
                cacheSelectedElements(board, elementIds);
            }
        } catch (error) {
            console.error(error);
        }
        onChange();
    };

    return board;
}
