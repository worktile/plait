import { BOARD_TO_HOST } from '../utils/weak-maps';
import { PlaitBoard } from '../interfaces/board';
import { isInPlaitBoard, transformPoint } from '../utils/board';
import { toPoint } from '../utils/dom';
import { Point } from '../interfaces/point';
import { Transforms } from '../transforms';
import { PlaitElement } from '../interfaces/element';
import { getSelectedElements, isIntersectionElements } from '../utils/selected-element';
import { MERGING, PlaitNode } from '../interfaces';
import { throttleRAF } from '../utils/common';
import { addMovingElements, removeMovingElements } from '../utils/moving-element';

let offsetX = 0;
let offsetY = 0;
let isMoving = false;
let startPoint: Point | null;
let activeElements: PlaitElement[] | null = [];

export function withMoving(board: PlaitBoard) {
    const { mousedown, mousemove, globalMouseup, globalMousemove } = board;

    board.mousedown = event => {
        const host = BOARD_TO_HOST.get(board);
        const point = transformPoint(board, toPoint(event.x, event.y, host!));
        const ranges = [{ anchor: point, focus: point }];
        let movableElements = board.children.filter(item => PlaitElement.isElement(item) && board.isMovable(item));
        if (movableElements.length) {
            startPoint = point;
            const selectedRootElements = getSelectedElements(board).filter(item => movableElements.includes(item));
            const intersectionSelectedElement = isIntersectionElements(board, selectedRootElements, ranges);
            if (intersectionSelectedElement) {
                activeElements = selectedRootElements;
            } else {
                activeElements = movableElements.filter(item =>
                    ranges.some(range => {
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
                // 阻止拖拽过程中画布默认滚动行为
                event.preventDefault();
                offsetX = endPoint[0] - startPoint[0];
                offsetY = endPoint[1] - startPoint[1];
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
                    addMovingElements(board, currentElements as PlaitElement[]);
                });
            }
        }
        mousemove(event);
    };

    board.globalMousemove = event => {
        if (isMoving) {
            const inPliatBordElement = isInPlaitBoard(board, event.x, event.y);
            if (!inPliatBordElement) {
                cancelMove(board);
            }
        }
        globalMousemove(event);
    };

    board.globalMouseup = event => {
        cancelMove(board);
        globalMouseup(event);
    };

    return board;
}

export function cancelMove(board: PlaitBoard) {
    startPoint = null;
    offsetX = 0;
    offsetY = 0;
    isMoving = false;
    activeElements = [];
    removeMovingElements(board);
    MERGING.set(board, false);
}
