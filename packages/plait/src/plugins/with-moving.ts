import { BOARD_TO_HOST } from '../utils/weak-maps';
import { PlaitBoard } from '../interfaces/board';
import { isInPlaitBoard, transformPoint } from '../utils/board';
import { toPoint } from '../utils/dom/common';
import { Point } from '../interfaces/point';
import { Transforms } from '../transforms';
import { PlaitElement } from '../interfaces/element';
import { getSelectedElements, isIntersectionElements } from '../utils/selected-element';
import { PlaitNode } from '../interfaces/node';
import { throttleRAF } from '../utils/common';
import { addMovingElements, removeMovingElements } from '../utils/moving-element';
import { MERGING } from '../interfaces/history';

export function withMoving(board: PlaitBoard) {
    const { mousedown, mousemove, globalMouseup, globalMousemove } = board;

    let offsetX = 0;
    let offsetY = 0;
    let isPreventDefault = false;
    let startPoint: Point | null;
    let activeElements: PlaitElement[] | null = [];

    board.mousedown = event => {
        const host = BOARD_TO_HOST.get(board);
        const point = transformPoint(board, toPoint(event.x, event.y, host!));
        const ranges = [{ anchor: point, focus: point }];
        let movableElements = board.children.filter(item => board.isMovable(item));
        if (movableElements.length) {
            startPoint = point;
            const selectedRootElements = getSelectedElements(board).filter(item => movableElements.includes(item));
            const intersectionSelectedElement = isIntersectionElements(board, selectedRootElements, ranges);
            if (intersectionSelectedElement) {
                activeElements = selectedRootElements;
            } else {
                activeElements = movableElements.filter(item =>
                    ranges.some(range => {
                        return board.isHitSelection(item, range);
                    })
                );
            }
        }

        mousedown(event);
    };

    board.mousemove = event => {
        if (startPoint && activeElements?.length && !PlaitBoard.hasBeenTextEditing(board)) {
            if (!isPreventDefault) {
                isPreventDefault = true;
            }
            const host = BOARD_TO_HOST.get(board);
            const endPoint = transformPoint(board, toPoint(event.x, event.y, host!));
            offsetX = endPoint[0] - startPoint[0];
            offsetY = endPoint[1] - startPoint[1];
            const offsetBuffer = 5;
            if (Math.abs(offsetX) > offsetBuffer || Math.abs(offsetY) > offsetBuffer) {
                throttleRAF(() => {
                    const currentElements = activeElements!.map(activeElement => {
                        const [x, y] = activeElement?.points![0];
                        const index = board.children.findIndex(item => item.id === activeElement.id);
                        Transforms.setNode(
                            board,
                            {
                                points: [[x + offsetX, y + offsetY]]
                            },
                            [index]
                        );
                        MERGING.set(board, true);
                        return PlaitNode.get(board, [index]);
                    });
                    PlaitBoard.getBoardNativeElement(board).classList.add('element-moving');
                    addMovingElements(board, currentElements as PlaitElement[]);
                });
            }
        }
        if (isPreventDefault) {
            // 阻止 move 过程中触发画布滚动行为
            event.preventDefault();
        }
        mousemove(event);
    };

    board.globalMousemove = event => {
        if (startPoint) {
            const inPlaitBoardElement = isInPlaitBoard(board, event.x, event.y);
            if (!inPlaitBoardElement) {
                cancelMove(board);
            }
        }
        globalMousemove(event);
    };

    board.globalMouseup = event => {
        isPreventDefault = false;
        if (startPoint) {
            cancelMove(board);
        }
        globalMouseup(event);
    };

    function cancelMove(board: PlaitBoard) {
        startPoint = null;
        offsetX = 0;
        offsetY = 0;
        activeElements = [];
        removeMovingElements(board);
        MERGING.set(board, false);
        PlaitBoard.getBoardNativeElement(board).classList.remove('element-moving');
    }

    return board;
}
