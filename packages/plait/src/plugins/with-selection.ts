import { PlaitNode } from '../interfaces/node';
import { PlaitBoard } from '../interfaces/board';
import { Point } from '../interfaces/point';
import { Transforms } from '../transforms';
import { transformPoint } from '../utils/board';
import { toPoint } from '../utils/dom';
import { depthFirstRecursion } from '../utils/tree';
import { PlaitElement } from '../interfaces/element';
import { RectangleClient } from '../interfaces/rectangle-client';

export function withSelection<T extends PlaitBoard>(board: T) {
    const { mousedown, mousemove, mouseup } = board;

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

    return board;
}

export const getElementIdsIntersectionSelection = (board: PlaitBoard) => {
    const elementIds: string[] = [];
    depthFirstRecursion<PlaitNode>(board, node => {
        if (PlaitElement.isElement(node) && board.isIntersectionSelection(node)) {
            elementIds.push(node.id);
        }
    });
    return elementIds;
};
