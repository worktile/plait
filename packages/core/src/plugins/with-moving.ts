import { BOARD_TO_HOST } from '../utils/weak-maps';
import { PlaitBoard } from '../interfaces/board';
import { isInPlaitBoard, transformPoint } from '../utils/board';
import { toPoint } from '../utils/dom/common';
import { Point } from '../interfaces/point';
import { Transforms } from '../transforms';
import { PlaitElement } from '../interfaces/element';
import { getHitElementByPoint, getSelectedElements } from '../utils/selected-element';
import { PlaitNode } from '../interfaces/node';
import { throttleRAF } from '../utils/common';
import { addMovingElements, getMovingElements, removeMovingElements } from '../utils/moving-element';
import { MERGING } from '../interfaces/history';
import { isPreventTouchMove, preventTouchMove, handleTouchTarget, getRectangleByElements, distanceBetweenPointAndPoint } from '../utils';
import { AlignReaction } from '../utils/reaction-manager';
import { RectangleClient } from '../interfaces';
import { PRESS_AND_MOVE_BUFFER } from '../constants';

export function withMoving(board: PlaitBoard) {
    const { pointerDown, pointerMove, globalPointerUp, globalPointerMove } = board;

    let offsetX = 0;
    let offsetY = 0;
    let isPreventDefault = false;
    let startPoint: Point | null;
    let activeElements: PlaitElement[] = [];
    let alignG: SVGGElement | null = null;
    let activeElementsRectangle: RectangleClient | null = null;

    board.pointerDown = (event: PointerEvent) => {
        const host = BOARD_TO_HOST.get(board);
        const point = transformPoint(board, toPoint(event.x, event.y, host!));
        let movableElements = board.children.filter(item => board.isMovable(item));
        if (!PlaitBoard.isReadonly(board) && movableElements.length && !isPreventTouchMove(board)) {
            startPoint = point;
            const selectedMovableElements = getSelectedElements(board).filter(item => movableElements.includes(item));
            const hitElement = getHitElementByPoint(board, point);
            if (hitElement && movableElements.includes(hitElement)) {
                if (selectedMovableElements.includes(hitElement)) {
                    activeElements = selectedMovableElements;
                } else {
                    activeElements = [hitElement];
                }
            }
            if (activeElements.length > 0) {
                preventTouchMove(board, event, true);
            }
            activeElementsRectangle = getRectangleByElements(board, activeElements, true);
        }
        pointerDown(event);
    };

    board.pointerMove = (event: PointerEvent) => {
        if (startPoint && activeElements.length && !PlaitBoard.hasBeenTextEditing(board)) {
            if (!isPreventDefault) {
                isPreventDefault = true;
            }
            alignG?.remove();
            const host = BOARD_TO_HOST.get(board);
            const endPoint = transformPoint(board, toPoint(event.x, event.y, host!));
            offsetX = endPoint[0] - startPoint[0];
            offsetY = endPoint[1] - startPoint[1];
            const distance = distanceBetweenPointAndPoint(...endPoint, ...startPoint);
            if (distance > PRESS_AND_MOVE_BUFFER || getMovingElements(board).length > 0) {
                throttleRAF(() => {
                    if (!activeElementsRectangle) {
                        return;
                    }
                    const newRectangle = {
                        ...activeElementsRectangle,
                        x: activeElementsRectangle.x + offsetX,
                        y: activeElementsRectangle.y + offsetY
                    };
                    const reactionManager = new AlignReaction(board, activeElements, newRectangle);
                    const ref = reactionManager.handleAlign();
                    offsetX -= ref.deltaX;
                    offsetY -= ref.deltaY;
                    alignG = ref.g;
                    PlaitBoard.getElementActiveHost(board).append(alignG);

                    handleTouchTarget(board);
                    const currentElements = activeElements.map(activeElement => {
                        const points = activeElement.points || [];
                        const [x, y] = activeElement.points![0];
                        const newPoints = points.map(p => [p[0] + offsetX, p[1] + offsetY]) as Point[];
                        const index = board.children.findIndex(item => item.id === activeElement.id);
                        Transforms.setNode(
                            board,
                            {
                                points: newPoints
                            },
                            [index]
                        );
                        MERGING.set(board, true);
                        return PlaitNode.get(board, [index]);
                    });
                    PlaitBoard.getBoardContainer(board).classList.add('element-moving');
                    addMovingElements(board, currentElements as PlaitElement[]);
                });
            }
        }
        if (isPreventDefault) {
            // 阻止 move 过程中触发画布滚动行为
            event.preventDefault();
        }
        pointerMove(event);
    };

    board.globalPointerMove = (event: PointerEvent) => {
        if (startPoint) {
            const inPlaitBoardElement = isInPlaitBoard(board, event.x, event.y);
            if (!inPlaitBoardElement) {
                cancelMove(board);
            }
        }
        globalPointerMove(event);
    };

    board.globalPointerUp = event => {
        isPreventDefault = false;
        if (startPoint) {
            cancelMove(board);
        }
        preventTouchMove(board, event, false);
        globalPointerUp(event);
    };

    function cancelMove(board: PlaitBoard) {
        alignG?.remove();
        startPoint = null;
        activeElementsRectangle = null;
        offsetX = 0;
        offsetY = 0;
        activeElements = [];
        removeMovingElements(board);
        MERGING.set(board, false);
        PlaitBoard.getBoardContainer(board).classList.remove('element-moving');
    }

    return board;
}
