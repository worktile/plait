import {
    PlaitBoard,
    PlaitElement,
    Point,
    distanceBetweenPointAndSegments,
    getHitElementByPoint,
    getNearestPointBetweenPointAndSegments
} from '@plait/core';
import { PlaitArrowLine, PlaitDrawElement } from '../interfaces';
import { ResizeHandle, ResizeRef, ResizeState, WithResizeOptions, getRatioByPoint, getTextManages, withResize } from '@plait/common';
import { DrawTransforms } from '../transforms';
import { getArrowLinePoints } from '../utils/arrow-line/arrow-line-basic';
import { getHitArrowLineTextIndex } from '../utils/position/arrow-line';

export const withArrowLineTextMove = (board: PlaitBoard) => {
    let textIndex = 0;
    const movableBuffer = 100;
    const options: WithResizeOptions<PlaitArrowLine> = {
        key: 'line-text',
        canResize: () => {
            return true;
        },
        hitTest: (point: Point) => {
            let result = null;
            const line = getHitElementByPoint(board, point, (element: PlaitElement) => {
                return PlaitDrawElement.isArrowLine(element);
            }) as undefined | PlaitArrowLine;
            if (line) {
                const index = getHitArrowLineTextIndex(board, line, point);
                const textManages = getTextManages(line);
                const textManage = textManages[index];
                if (index !== -1 && !textManage.isEditing) {
                    textIndex = index;
                    return { element: line, handle: ResizeHandle.e };
                }
            }
            return result;
        },
        onResize: (resizeRef: ResizeRef<PlaitArrowLine>, resizeState: ResizeState) => {
            const element = resizeRef.element;
            if (element) {
                const movingPoint = resizeState.endPoint;
                const points = getArrowLinePoints(board, element);
                const distance = distanceBetweenPointAndSegments(points, movingPoint);
                if (distance <= movableBuffer) {
                    const point = getNearestPointBetweenPointAndSegments(movingPoint, points, false);
                    const position = getRatioByPoint(points, point);
                    const texts = [...element.texts];
                    texts[textIndex] = {
                        ...texts[textIndex],
                        position
                    };
                    DrawTransforms.setArrowLineTexts(board, element, texts);
                }
            }
        }
    };

    withResize<PlaitArrowLine>(board, options);

    return board;
};
