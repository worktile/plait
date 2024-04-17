import {
    MERGING,
    PlaitBoard,
    RectangleClient,
    Transforms,
    createG,
    getRectangleByElements,
    getSelectedElements,
    getSelectionAngle,
    isMainPointer,
    isSelectionMoving,
    preventTouchMove,
    rotatePoints,
    throttleRAF,
    toHostPoint,
    toViewBoxPoint,
    drawRectangle,
    ACTIVE_STROKE_WIDTH,
    SELECTION_BORDER_COLOR,
    setAngleForG,
    rotateElements,
    getAngleBetweenPoints,
    ROTATE_HANDLE_CLASS_NAME,
    SELECTION_RECTANGLE_CLASS_NAME,
    normalizeAngle,
    degreesToRadians
} from '@plait/core';
import { addRotating, removeRotating, drawHandle, drawRotateHandle, isRotating, RotateRef } from '@plait/common';
import { PlaitDrawElement } from '../interfaces';
import { getRotateHandleRectangle } from '../utils/position/geometry';

export const withDrawRotate = (board: PlaitBoard) => {
    const { pointerDown, pointerMove, globalPointerUp, afterChange, drawActiveRectangle, keyDown } = board;
    let rotateRef: RotateRef | null = null;
    let rotateHandleG: SVGGElement | null;
    let needCustomActiveRectangle = false;

    const canRotate = () => {
        const elements = getSelectedElements(board);
        return elements.length > 0 && elements.every(el => PlaitDrawElement.isGeometry(el) || PlaitDrawElement.isImage(el));
    };

    board.pointerDown = (event: PointerEvent) => {
        if (!canRotate() || PlaitBoard.isReadonly(board) || PlaitBoard.hasBeenTextEditing(board) || !isMainPointer(event)) {
            pointerDown(event);
            return;
        }
        const point = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
        const elements = getSelectedElements(board) as PlaitDrawElement[];
        const boundingRectangle = getRectangleByElements(board, elements, false);
        const handleRectangle = getRotateHandleRectangle(boundingRectangle);
        const angle = getSelectionAngle(elements);
        const rotatedPoint = angle ? rotatePoints(point, RectangleClient.getCenterPoint(boundingRectangle), -angle) : point;
        if (handleRectangle && RectangleClient.isHit(RectangleClient.getRectangleByPoints([rotatedPoint, rotatedPoint]), handleRectangle)) {
            rotateRef = {
                elements: elements,
                startPoint: point
            };
        }
        pointerDown(event);
    };

    board.pointerMove = (event: PointerEvent) => {
        if (rotateRef) {
            event.preventDefault();
            rotateRef.isShift = !!event.shiftKey;
            addRotating(board, rotateRef);
            const endPoint = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
            const selectionRectangle = getRectangleByElements(board, rotateRef.elements, false);
            const selectionCenterPoint = RectangleClient.getCenterPoint(selectionRectangle);
            if (!getSelectionAngle(rotateRef.elements) && rotateRef.elements.length > 1) {
                needCustomActiveRectangle = true;
            }

            throttleRAF(board, 'with-common-rotate', () => {
                if (rotateRef && rotateRef.startPoint) {
                    let angle = getAngleBetweenPoints(rotateRef.startPoint, endPoint, selectionCenterPoint);
                    if (rotateRef.isShift) {
                        angle += Math.PI / 12 / 2;
                        angle -= angle % (Math.PI / 12);
                    }

                    const selectionAngle = getSelectionAngle(rotateRef.elements);
                    let remainder = (selectionAngle + angle) % (Math.PI / 2);

                    if (Math.PI / 2 - remainder <= degreesToRadians(5)) {
                        const snapAngle = Math.PI / 2 - remainder;
                        angle += snapAngle;
                    }

                    if (remainder <= degreesToRadians(5)) {
                        const snapAngle = -remainder;
                        angle += snapAngle;
                    }

                    rotateRef.angle = normalizeAngle(angle);
                    if (rotateRef.angle) {
                        rotateElements(board, rotateRef.elements, rotateRef.angle);
                    }
                    PlaitBoard.getBoardContainer(board).classList.add('element-rotating');
                }
            });
            return;
        }

        pointerMove(event);
    };

    board.globalPointerUp = (event: PointerEvent) => {
        globalPointerUp(event);
        if (needCustomActiveRectangle) {
            needCustomActiveRectangle = false;
            const selectedElements = getSelectedElements(board);
            Transforms.addSelectionWithTemporaryElements(board, selectedElements);
        }
        PlaitBoard.getBoardContainer(board).classList.remove('element-rotating');
        removeRotating(board);
        rotateRef = null;
        MERGING.set(board, false);
        preventTouchMove(board, event, false);
    };

    board.afterChange = () => {
        afterChange();
        if (rotateHandleG) {
            rotateHandleG.remove();
            rotateHandleG = null;
        }

        if (canRotate() && !isSelectionMoving(board)) {
            if (needCustomActiveRectangle && rotateRef) {
                const boundingRectangle = getRectangleByElements(board, rotateRef.elements, false);
                rotateHandleG = drawRotateHandle(board, boundingRectangle);
                rotateHandleG.classList.add(ROTATE_HANDLE_CLASS_NAME);
                if (rotateRef.angle) {
                    setAngleForG(rotateHandleG, RectangleClient.getCenterPoint(boundingRectangle), rotateRef.angle);
                }
            } else {
                const elements = getSelectedElements(board) as PlaitDrawElement[];
                const boundingRectangle = getRectangleByElements(board, elements, false);
                rotateHandleG = drawRotateHandle(board, boundingRectangle);
                rotateHandleG.classList.add(ROTATE_HANDLE_CLASS_NAME);
                setAngleForG(rotateHandleG, RectangleClient.getCenterPoint(boundingRectangle), getSelectionAngle(elements));
            }
            PlaitBoard.getElementActiveHost(board).append(rotateHandleG);
        }
    };

    board.drawActiveRectangle = () => {
        if (needCustomActiveRectangle && rotateRef) {
            const rectangle = getRectangleByElements(board, rotateRef.elements, false);
            const rectangleG = drawRectangle(board, RectangleClient.inflate(rectangle, ACTIVE_STROKE_WIDTH), {
                stroke: SELECTION_BORDER_COLOR,
                strokeWidth: ACTIVE_STROKE_WIDTH
            });
            rectangleG.classList.add(SELECTION_RECTANGLE_CLASS_NAME);
            if (rotateRef.angle) {
                setAngleForG(rectangleG, RectangleClient.getCenterPoint(rectangle), rotateRef.angle);
            }
            return rectangleG;
        }
        return drawActiveRectangle();
    };

    return board;
};
