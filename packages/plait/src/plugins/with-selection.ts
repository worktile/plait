import { PlaitBoard } from '../interfaces/board';
import { Point } from '../interfaces/point';
import { Transforms } from '../transforms';
import { transformPoint } from '../utils/board';
import { toPoint } from '../utils/dom';
import { RectangleClient } from '../interfaces/rectangle-client';
import { cacheSelectedElements, calcElementIntersectionSelection } from '../utils/selected-element';

export function withSelection<T extends PlaitBoard>(board: T) {
    const { mousedown, mousemove, mouseup, onChange } = board;

    let start: Point | null = null;
    let end: Point | null = null;
    let roughSvg: SVGGElement;

    board.mousedown = (event: MouseEvent) => {
        start = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
        mousedown(event);
    };

    board.mousemove = (event: MouseEvent) => {
        const movedTarget = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
        if (start) {
            const rectangleClient = RectangleClient.toRectangleClient([start, movedTarget]);
            if (Math.hypot(rectangleClient.width, rectangleClient.height) > 5) {
                end = movedTarget;
                roughSvg?.remove();
                const rough = PlaitBoard.getRoughSVG(board);
                roughSvg = rough.rectangle(rectangleClient.x, rectangleClient.y, rectangleClient.width, rectangleClient.height, {
                    stroke: '#4e8afa',
                    strokeWidth: 1
                });
                PlaitBoard.getHost(board).append(roughSvg);
            }
        }
        mousemove(event);
    };

    board.mouseup = (event: MouseEvent) => {
        if (start && end) {
            roughSvg?.remove();
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
