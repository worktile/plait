import { PlaitBoard } from '../interfaces/board';
import { Point } from '../interfaces/point';
import { Transforms } from '../transforms';
import { transformPoint } from '../utils/board';
import { toPoint } from '../utils/dom';
import { RectangleClient } from '../interfaces/rectangle-client';
import { cacheSelectedElements, calcElementIntersectionSelection } from '../utils/selected-element';
import { SELECTION_BORDER_COLOR, SELECTION_FILL_COLOR } from '../interfaces';
import { getRectangleByElements } from '../utils/element';

export function withSelection<T extends PlaitBoard>(board: T) {
    const { mousedown, globalMousemove, globalMouseup, onChange } = board;

    let start: Point | null = null;
    let end: Point | null = null;
    let selectionMovingG: SVGGElement;
    let selectionOuterG: SVGGElement;

    board.mousedown = (event: MouseEvent) => {
        selectionOuterG?.remove();
        if (event.button === 0) {
            start = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
        }
        mousedown(event);
    };

    board.globalMousemove = (event: MouseEvent) => {
        if (start) {
            const movedTarget = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
            const { x, y, width, height } = RectangleClient.toRectangleClient([start, movedTarget]);
            if (Math.hypot(width, height) > 5) {
                end = movedTarget;
                PlaitBoard.getBoardNativeElement(board).classList.add('selection-moving');
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
        globalMousemove(event);
    };

    board.globalMouseup = (event: MouseEvent) => {
        if (start && end) {
            PlaitBoard.getBoardNativeElement(board).classList.remove('selection-moving');
            selectionMovingG?.remove();
            Transforms.setSelection(board, { ranges: [{ anchor: start, focus: end }] });
        } else if (start) {
            Transforms.setSelection(board, { ranges: [{ anchor: start, focus: start }] });
        }

        start = null;
        end = null;

        globalMouseup(event);
    };

    board.onChange = () => {
        // calc selected elements entry
        try {
            if (board.operations.find(value => value.type === 'set_selection')) {
                const elementIds = calcElementIntersectionSelection(board);
                cacheSelectedElements(board, elementIds);
                const { x, y, width, height } = getRectangleByElements(board, elementIds, false);
                if (width > 0 && height > 0) {
                    const rough = PlaitBoard.getRoughSVG(board);
                    selectionOuterG = rough.rectangle(x - 2, y - 2, width + 4, height + 4, {
                        stroke: SELECTION_BORDER_COLOR,
                        strokeWidth: 1,
                        fillStyle: 'solid'
                    });
                    PlaitBoard.getHost(board).append(selectionOuterG);
                }
            }
        } catch (error) {
            console.error(error);
        }
        onChange();
    };

    return board;
}
