import { BOARD_TO_HOST } from '../utils/weak-maps';
import { PlaitBoard } from '../interfaces/board';
import { transformPoint } from '../utils/board';
import { toPoint } from '../utils/dom';
import { Point } from '../interfaces/point';
import { Transforms } from '../transforms';
import { PlaitElement } from '../interfaces/element';
import { updatePointerType } from '../transforms/board';
import { PlaitPointerType } from '../interfaces/pointer';
import { getSelectedElements } from '../utils/selected-element';
import { isIntersectionSelectedElement } from '../utils/selection';

export function withMove(board: PlaitBoard) {
    const { mousedown, mousemove, mouseup } = board;

    let offsetX = 0;
    let offsetY = 0;
    let startPoint: Point | null;
    let activeElements: PlaitElement[] | null = [];

    board.mousedown = event => {
        if (board.options.readonly) {
            mousedown(event);
            return;
        }
        const host = BOARD_TO_HOST.get(board);
        const point = transformPoint(board, toPoint(event.x, event.y, host!));
        const ranges = [{ anchor: point, focus: point }];
        const selectedRootElements = getSelectedElements(board).filter(item => board.children.includes(item));
        const intersectionSelectedRootElement = isIntersectionSelectedElement(board, selectedRootElements, ranges);
        if (intersectionSelectedRootElement) {
            selectedRootElements.forEach(value => {
                if (PlaitElement.isElement(value) && board.isMovable(value)) {
                    startPoint = point;
                    value.points?.length && activeElements?.push(value);
                }
            });
        } else {
            board.children.forEach(value => {
                let isIntersectionSelection = board.selection?.ranges.some(range => {
                    return board.isIntersectionSelection(value, range);
                });
                if (PlaitElement.isElement(value) && board.isMovable(value) && isIntersectionSelection) {
                    startPoint = point;
                    value.points?.length && activeElements?.push(value);
                }
            });
        }

        mousedown(event);
    };

    board.mousemove = event => {
        if (!board.options.readonly && startPoint && activeElements?.length) {
            const host = BOARD_TO_HOST.get(board);
            const endPoint = transformPoint(board, toPoint(event.x, event.y, host!));
            if (board.pointer !== PlaitPointerType.move) {
                updatePointerType(board, PlaitPointerType.move);
            } else {
                offsetX = endPoint[0] - startPoint[0];
                offsetY = endPoint[1] - startPoint[1];
                activeElements.map(activeElement => {
                    const [x, y] = activeElement?.points![0];
                    const index = board.children.findIndex(item => item.id === activeElement.id);
                    window.requestAnimationFrame(() => {
                        Transforms.setNode(
                            board,
                            {
                                points: [[x + offsetX, y + offsetY]]
                            },
                            [index]
                        );
                    });
                });
            }
        }
        mousemove(event);
    };

    board.mouseup = event => {
        startPoint = null;
        offsetX = 0;
        offsetY = 0;
        updatePointerType(board, PlaitPointerType.selection);
        activeElements = [];
        mouseup(event);
    };

    return board;
}
