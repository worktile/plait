import {
    PlaitBoard,
    PlaitElement,
    Point,
    distanceBetweenPointAndSegments,
    getHitElementByPoint,
    getNearestPointBetweenPointAndSegments
} from '@plait/core';
import { PlaitDrawElement, PlaitLine } from '../interfaces';
import { getHitLineTextIndex, getLinePoints } from '../utils';
import { ResizeHandle, ResizeRef, ResizeState, WithResizeOptions, getRatioByPoint, withResize } from '@plait/common';
import { DrawTransforms } from '../transforms';
import { LineComponent } from '../line.component';

export const withLineTextMove = (board: PlaitBoard) => {
    let textIndex = 0;
    const movableBuffer = 100;
    const options: WithResizeOptions<PlaitLine> = {
        key: 'draw-line',
        canResize: () => {
            return true;
        },
        detect: (point: Point) => {
            let result = null;
            const line = getHitElementByPoint(board, point, (element: PlaitElement) => {
                return PlaitDrawElement.isLine(element);
            }) as undefined | PlaitLine;
            if (line) {
                const index = getHitLineTextIndex(board, line, point);
                const hitComponent = PlaitElement.getComponent(line) as LineComponent;
                const textManage = hitComponent.textManages[index];
                if (index !== -1 && !textManage.isEditing) {
                    textIndex = index;
                    return { element: line, handle: ResizeHandle.e };
                }
            }
            return result;
        },
        onResize: (resizeRef: ResizeRef<PlaitLine>, resizeState: ResizeState) => {
            const element = resizeRef.element;
            if (element) {
                const movingPoint = resizeState.endTransformPoint;
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
                }
            }
        }
    };

    withResize<PlaitLine>(board, options);

    return board;
};
