import { PlaitBoard } from '../interfaces/board';
import { isInPlaitBoard } from '../utils/board';
import { isMainPointer } from '../utils/dom/common';
import { Point } from '../interfaces/point';
import { Transforms } from '../transforms';
import { PlaitElement } from '../interfaces/element';
import { getHitElementByPoint, getSelectedElements } from '../utils/selected-element';
import { PlaitNode } from '../interfaces/node';
import { throttleRAF } from '../utils/common';
import { cacheMovingElements, getMovingElements, isMovingElements, removeMovingElements } from '../utils/moving-element';
import { MERGING } from '../interfaces/history';
import {
    isPreventTouchMove,
    preventTouchMove,
    handleTouchTarget,
    getRectangleByElements,
    distanceBetweenPointAndPoint,
    toHostPoint,
    toViewBoxPoint,
    hotkeys,
    getElementsInGroupByElement,
    getRectangleByAngle,
    getSelectionAngle
} from '../utils';
import { AlignReaction } from '../utils/reaction-manager';
import { PlaitGroupElement, PlaitPointerType, RectangleClient } from '../interfaces';
import { ACTIVE_MOVING_CLASS_NAME, PRESS_AND_MOVE_BUFFER } from '../constants';
import { addSelectionWithTemporaryElements } from '../transforms/selection';

export function withMoving(board: PlaitBoard) {
    const { pointerDown, pointerMove, globalPointerUp, globalPointerMove } = board;

    let offsetX = 0;
    let offsetY = 0;
    let isPreventDefault = false;
    let startPoint: Point | null;
    let activeElements: PlaitElement[] = [];
    let alignG: SVGGElement | null = null;
    let activeElementsRectangle: RectangleClient | null = null;
    let selectedTargetElements: PlaitElement[] | null = null;
    let hitTargetElement: PlaitElement | undefined = undefined;
    let isHitSelectedTarget: boolean | undefined = undefined;

    board.pointerDown = (event: PointerEvent) => {
        if (
            PlaitBoard.isReadonly(board) ||
            !PlaitBoard.isPointer(board, PlaitPointerType.selection) ||
            isPreventTouchMove(board) ||
            !isMainPointer(event)
        ) {
            pointerDown(event);
            return;
        }
        const point = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
        hitTargetElement = getHitElementByPoint(board, point, el => board.isMovable(el));
        selectedTargetElements = getSelectedTargetElements(board);
        isHitSelectedTarget = hitTargetElement && selectedTargetElements.includes(hitTargetElement);
        if (hitTargetElement && isHitSelectedTarget) {
            startPoint = point;
            activeElements = selectedTargetElements;
            activeElementsRectangle = getRectangleByElements(board, activeElements, true);
            preventTouchMove(board, event, true);
        } else if (hitTargetElement) {
            startPoint = point;
            const relatedElements = board.getRelatedFragment([], [hitTargetElement]);
            activeElements = [...getElementsInGroupByElement(board, hitTargetElement), ...relatedElements];
            activeElementsRectangle = getRectangleByElements(board, activeElements, true);
            preventTouchMove(board, event, true);
        } else {
            // 只有判定用户未击中元素之后才可以验证用户是否击中了已选元素所在的空白区域
            // Only after it is determined that the user has not hit the element can it be verified whether the user hit the blank area where the selected element is located.
            const targetRectangle = selectedTargetElements.length > 0 && getRectangleByElements(board, selectedTargetElements, false);
            const isHitInTargetRectangle = targetRectangle && RectangleClient.isPointInRectangle(targetRectangle, point);
            if (isHitInTargetRectangle) {
                startPoint = point;
                activeElements = selectedTargetElements;
                activeElementsRectangle = targetRectangle;
                preventTouchMove(board, event, true);
            }
        }
        pointerDown(event);
    };

    board.pointerMove = (event: PointerEvent) => {
        if (startPoint && activeElements.length && !PlaitBoard.hasBeenTextEditing(board)) {
            if (!isPreventDefault) {
                isPreventDefault = true;
            }
            alignG?.remove();
            const endPoint = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
            offsetX = endPoint[0] - startPoint[0];
            offsetY = endPoint[1] - startPoint[1];
            const distance = distanceBetweenPointAndPoint(...endPoint, ...startPoint);
            if (distance > PRESS_AND_MOVE_BUFFER || getMovingElements(board).length > 0) {
                if (hitTargetElement && !isHitSelectedTarget && selectedTargetElements && selectedTargetElements.length > 0) {
                    addSelectionWithTemporaryElements(board, []);
                    hitTargetElement = undefined;
                    selectedTargetElements = null;
                    isHitSelectedTarget = undefined;
                }
                throttleRAF(board, 'with-moving', () => {
                    if (!activeElementsRectangle) {
                        return;
                    }
                    const newRectangle = {
                        ...activeElementsRectangle,
                        x: activeElementsRectangle.x + offsetX,
                        y: activeElementsRectangle.y + offsetY
                    };
                    const reactionManager = new AlignReaction(
                        board,
                        activeElements,
                        getRectangleByAngle(newRectangle, getSelectionAngle(activeElements)) || newRectangle
                    );
                    const ref = reactionManager.handleAlign();
                    offsetX -= ref.deltaX;
                    offsetY -= ref.deltaY;
                    alignG = ref.g;
                    alignG.classList.add(ACTIVE_MOVING_CLASS_NAME);
                    PlaitBoard.getElementActiveHost(board).append(alignG);
                    handleTouchTarget(board);
                    const currentElements = updatePoints(board, activeElements, offsetX, offsetY);
                    PlaitBoard.getBoardContainer(board).classList.add('element-moving');
                    cacheMovingElements(board, currentElements as PlaitElement[]);
                });
            }
        }
        if (isPreventDefault) {
            // Prevent canvas scrolling behavior from being triggered during move
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
        hitTargetElement = undefined;
        selectedTargetElements = null;
        isHitSelectedTarget = undefined;
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
        if (isMovingElements(board)) {
            removeMovingElements(board);
        }
        MERGING.set(board, false);
        PlaitBoard.getBoardContainer(board).classList.remove('element-moving');
    }

    return withArrowMoving(board);
}

export function withArrowMoving(board: PlaitBoard) {
    const { keyDown, keyUp } = board;
    board.keyDown = (event: KeyboardEvent) => {
        const selectedElements = getSelectedElements(board);
        if (!PlaitBoard.isReadonly(board) && selectedElements.length > 0 && (hotkeys.isArrow(event) || hotkeys.isExtendArrow(event))) {
            event.preventDefault();
            const isShift = event.shiftKey ? true : false;
            const offset = [0, 0];
            const buffer = isShift ? 10 : 1;
            switch (true) {
                case hotkeys.isMoveUp(event) || hotkeys.isExtendUp(event): {
                    offset[1] = -buffer;
                    break;
                }
                case hotkeys.isMoveDown(event) || hotkeys.isExtendDown(event): {
                    offset[1] = buffer;
                    break;
                }
                case hotkeys.isMoveBackward(event) || hotkeys.isExtendBackward(event): {
                    offset[0] = -buffer;
                    break;
                }
                case hotkeys.isMoveForward(event) || hotkeys.isExtendForward(event): {
                    offset[0] = buffer;
                    break;
                }
            }
            const targetElements = getSelectedTargetElements(board);
            throttleRAF(board, 'with-arrow-moving', () => {
                updatePoints(board, targetElements, offset[0], offset[1]);
            });
        }
        keyDown(event);
    };

    board.keyUp = (event: KeyboardEvent) => {
        MERGING.set(board, false);
        keyUp(event);
    };
    return board;
}

export function getSelectedTargetElements(board: PlaitBoard) {
    const selectedElements = getSelectedElements(board);
    const movableElements = board.children.filter(item => board.isMovable(item));
    const targetElements = selectedElements.filter(element => {
        return movableElements.includes(element);
    });
    const relatedElements = board.getRelatedFragment([]);
    targetElements.push(...relatedElements);
    return targetElements;
}

export function updatePoints(board: PlaitBoard, targetElements: PlaitElement[], offsetX: number, offsetY: number) {
    const validElements = targetElements.filter(
        element => !PlaitGroupElement.isGroup(element) && board.children.findIndex(item => item.id === element.id) > -1
    );
    const currentElements = validElements.map(element => {
        const points = element.points || [];
        const newPoints = points.map(p => [p[0] + offsetX, p[1] + offsetY]) as Point[];
        const index = board.children.findIndex(item => item.id === element.id);
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
    return currentElements;
}
