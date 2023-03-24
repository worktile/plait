import { BOARD_TO_HOST } from '../utils/weak-maps';
import { PlaitBoard } from '../interfaces/board';
import { transformPoint } from '../utils/board';
import { toPoint } from '../utils/dom';
import { Point } from '../interfaces/point';
import { Transforms } from '../transforms';
import { PlaitElement } from '../interfaces/element';
import { getSelectedElements, isIntersectionElements } from '../utils/selected-element';
import { MERGING } from '../interfaces';

export function withMove(board: PlaitBoard) {
    const { mousedown, mousemove, globalMouseup } = board;

    let offsetX = 0;
    let offsetY = 0;
    let isMoving = false;
    let startPoint: Point | null;
    let activeElements: PlaitElement[] | null = [];

    board.mousedown = event => {
        const host = BOARD_TO_HOST.get(board);
        const point = transformPoint(board, toPoint(event.x, event.y, host!));
        const ranges = [{ anchor: point, focus: point }];
        let movableElements = board.children.filter(item => PlaitElement.isElement(item) && board.isMovable(item));
        const selectedRootElements = getSelectedElements(board).filter(item => movableElements.includes(item));
        if (movableElements.length) {
            startPoint = point;
            const intersectionSelectedElement = isIntersectionElements(board, selectedRootElements, ranges);
            if (intersectionSelectedElement) {
                activeElements = selectedRootElements;
            } else {
                activeElements = movableElements.filter(item =>
                    board.selection?.ranges.some(range => {
                        return board.isIntersectionSelection(item, range);
                    })
                );
            }
        }

        mousedown(event);
    };

    board.mousemove = event => {
        if (startPoint && activeElements?.length) {
            const host = BOARD_TO_HOST.get(board);
            const endPoint = transformPoint(board, toPoint(event.x, event.y, host!));
            if (!isMoving) {
                isMoving = true;
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
                        MERGING.set(board, true);
                    });
                });
            }
        }
        mousemove(event);
    };

    board.globalMouseup = event => {
        if (isMoving) {
            startPoint = null;
            offsetX = 0;
            offsetY = 0;
            isMoving = false;
            activeElements = [];
            MERGING.set(board, false);
        }

        globalMouseup(event);
    };

    return board;
}
