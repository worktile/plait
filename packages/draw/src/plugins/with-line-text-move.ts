import {
    MERGING,
    PlaitBoard,
    PlaitElement,
    distanceBetweenPointAndSegments,
    getHitElementByPoint,
    getNearestPointBetweenPointAndSegments,
    preventTouchMove,
    toPoint,
    transformPoint
} from '@plait/core';
import { PlaitDrawElement, PlaitLine } from '../interfaces';
import { getHitLineTextIndex, getLinePoints } from '../utils';
import { getRatioByPoint } from '@plait/common';
import { DrawTransforms } from '../transforms';
import { LineComponent } from '../line.component';

export const withLineTextMove = (board: PlaitBoard) => {
    const { pointerDown, pointerMove, pointerUp } = board;

    let textIndex = 0;
    let element: PlaitLine | null = null;
    const movableBuffer = 100;

    board.pointerDown = (event: PointerEvent) => {
        if (PlaitBoard.isReadonly(board)) return;
        const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
        const line = getHitElementByPoint(board, point, (element: PlaitElement) => {
            return PlaitDrawElement.isLine(element);
        }) as undefined | PlaitLine;
        if (line) {
            const index = getHitLineTextIndex(board, line, point);
            const hitComponent = PlaitElement.getComponent(line) as LineComponent;
            const textManage = hitComponent.textManages[index];
            if (index !== -1 && !textManage.isEditing) {
                element = line;
                textIndex = index;
                preventTouchMove(board, event, true);
            }
        }
        pointerDown(event);
    };

    board.pointerMove = (event: PointerEvent) => {
        if (element) {
            event.preventDefault();
            const movingPoint = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
            const points = getLinePoints(board, element);
            const distance = distanceBetweenPointAndSegments(points, movingPoint);
            if (distance <= movableBuffer) {
                const point = getNearestPointBetweenPointAndSegments(movingPoint, points, false);
                const position = getRatioByPoint(points, point);
                const texts = [...element.texts];
                texts[textIndex] = {
                    ...texts[textIndex],
                    position
                };
                DrawTransforms.setLineTexts(board, element, texts);
                MERGING.set(board, true);
            }
        }

        pointerMove(event);
    };

    board.pointerUp = (event: PointerEvent) => {
        if (element) {
            MERGING.set(board, false);
            element = null;
        }

        pointerUp(event);
    };

    return board;
};
