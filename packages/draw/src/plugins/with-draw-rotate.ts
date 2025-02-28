import {
    MERGING,
    PlaitBoard,
    RectangleClient,
    Transforms,
    getRectangleByElements,
    getSelectedElements,
    getSelectionAngle,
    isMainPointer,
    isSelectionMoving,
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
    degreesToRadians,
    toActiveRectangleFromViewBoxRectangle,
    toActivePoint
} from '@plait/core';
import { addRotating, removeRotating, drawRotateHandle, RotateRef } from '@plait/common';
import { PlaitDrawElement } from '../interfaces';
import { getRotateHandleRectangle } from '../utils/position/geometry';

export const withDrawRotate = (board: PlaitBoard) => {
    const { pointerDown, pointerMove, globalPointerUp, afterChange, drawSelectionRectangle } = board;
    let rotateRef: RotateRef | null = null;
    let rotateHandleG: SVGGElement | null;
    let needCustomActiveRectangle = false;

    const canRotate = () => {
        const elements = getSelectedElements(board);
        return (
            elements.length > 0 &&
            elements.every(
                (el) =>
                    (PlaitDrawElement.isDrawElement(el) && !PlaitDrawElement.isArrowLine(el)) ||
                    PlaitDrawElement.isCustomGeometryElement(board, el)
            )
        );
    };

    board.pointerDown = (event: PointerEvent) => {
        if (!canRotate() || PlaitBoard.isReadonly(board) || PlaitBoard.hasBeenTextEditing(board) || !isMainPointer(event)) {
            pointerDown(event);
            return;
        }
        const activePoint = toActivePoint(board, event.x, event.y);
        const elements = getSelectedElements(board) as PlaitDrawElement[];
        const rectangle = getRectangleByElements(board, elements, false);
        const activeRectangle = toActiveRectangleFromViewBoxRectangle(board, rectangle);
        const handleRectangle = getRotateHandleRectangle(activeRectangle);
        const angle = getSelectionAngle(elements);
        const rotatedPoint = angle ? rotatePoints(activePoint, RectangleClient.getCenterPoint(activeRectangle), -angle) : activePoint;
        if (handleRectangle && RectangleClient.isHit(RectangleClient.getRectangleByPoints([rotatedPoint, rotatedPoint]), handleRectangle)) {
            rotateRef = {
                elements: [...elements],
                startPoint: activePoint
            };
        }
        pointerDown(event);
    };

    board.pointerMove = (event: PointerEvent) => {
        if (rotateRef) {
            event.preventDefault();
            const isShift = !!event.shiftKey;
            addRotating(board, rotateRef);
            const endPoint = toActivePoint(board, event.x, event.y);
            const rectangle = getRectangleByElements(board, rotateRef.elements, false);
            const activeRectangle = toActiveRectangleFromViewBoxRectangle(board, rectangle);
            const selectionCenterPoint = RectangleClient.getCenterPoint(activeRectangle);
            if (!getSelectionAngle(rotateRef.elements) && rotateRef.elements.length > 1) {
                needCustomActiveRectangle = true;
            }

            throttleRAF(board, 'with-common-rotate', () => {
                if (rotateRef && rotateRef.startPoint) {
                    let angle = getAngleBetweenPoints(rotateRef.startPoint, endPoint, selectionCenterPoint);
                    const selectionAngle = getSelectionAngle(rotateRef.elements);
                    angle = normalizeAngle(selectionAngle + angle);
                    if (isShift) {
                        angle += Math.PI / 12 / 2;
                        angle -= angle % (Math.PI / 12);
                    }

                    let remainder = angle % (Math.PI / 2);
                    if (Math.PI / 2 - remainder <= degreesToRadians(5)) {
                        const snapAngle = Math.PI / 2 - remainder;
                        angle += snapAngle;
                    }

                    if (remainder <= degreesToRadians(5)) {
                        const snapAngle = -remainder;
                        angle += snapAngle;
                    }

                    rotateRef.angle = normalizeAngle(angle - selectionAngle) || 0;
                    rotateElements(board, rotateRef.elements, rotateRef.angle);
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
                const boundingActiveRectangle = toActiveRectangleFromViewBoxRectangle(board, boundingRectangle);
                rotateHandleG = drawRotateHandle(board, boundingActiveRectangle);
                rotateHandleG.classList.add(ROTATE_HANDLE_CLASS_NAME);
                if (rotateRef.angle) {
                    setAngleForG(rotateHandleG, RectangleClient.getCenterPoint(boundingActiveRectangle), rotateRef.angle);
                }
            } else {
                const elements = getSelectedElements(board) as PlaitDrawElement[];
                const boundingRectangle = getRectangleByElements(board, elements, false);
                const boundingActiveRectangle = toActiveRectangleFromViewBoxRectangle(board, boundingRectangle);
                rotateHandleG = drawRotateHandle(board, boundingActiveRectangle);
                rotateHandleG.classList.add(ROTATE_HANDLE_CLASS_NAME);
                setAngleForG(rotateHandleG, RectangleClient.getCenterPoint(boundingActiveRectangle), getSelectionAngle(elements));
            }
            PlaitBoard.getActiveHost(board).append(rotateHandleG);
        }
    };

    board.drawSelectionRectangle = () => {
        if (needCustomActiveRectangle && rotateRef) {
            const rectangle = getRectangleByElements(board, rotateRef.elements, false);
            const activeRectangle = toActiveRectangleFromViewBoxRectangle(board, rectangle);
            const rectangleG = drawRectangle(board, RectangleClient.inflate(activeRectangle, ACTIVE_STROKE_WIDTH), {
                stroke: SELECTION_BORDER_COLOR,
                strokeWidth: ACTIVE_STROKE_WIDTH
            });
            rectangleG.classList.add(SELECTION_RECTANGLE_CLASS_NAME);
            if (rotateRef.angle) {
                setAngleForG(rectangleG, RectangleClient.getCenterPoint(activeRectangle), rotateRef.angle);
            }
            return rectangleG;
        }
        return drawSelectionRectangle();
    };

    return board;
};
