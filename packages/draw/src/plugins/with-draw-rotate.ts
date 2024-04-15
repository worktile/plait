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
    PlaitElement,
    getAngleBetweenPoints
} from '@plait/core';
import { addRotating, removeRotating, drawHandle, drawRotateHandle, isRotating, RotateRef } from '@plait/common';
import { PlaitDrawElement } from '../interfaces';
import { getRotateHandleRectangle } from '../utils/position/geometry';

export const withDrawRotate = (board: PlaitBoard) => {
    const { pointerDown, pointerMove, globalPointerUp, afterChange, drawActiveRectangle } = board;
    let rotateRef: RotateRef | null = null;
    let handleG: SVGGElement | null;
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
            addRotating(board, rotateRef);
            const endPoint = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
            const selectionRectangle = getRectangleByElements(board, rotateRef.elements, false);
            const selectionCenterPoint = RectangleClient.getCenterPoint(selectionRectangle);
            if (!getSelectionAngle(rotateRef.elements) && rotateRef.elements.length > 1) {
                needCustomActiveRectangle = true;
            }

            throttleRAF(board, 'with-common-rotate', () => {
                if (rotateRef && rotateRef.startPoint) {
                    rotateRef.angle = getAngleBetweenPoints(rotateRef.startPoint, endPoint, selectionCenterPoint);
                    if (rotateRef.angle) {
                        rotateElements(board, rotateRef.elements, rotateRef.angle);
                    }
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
        removeRotating(board);
        rotateRef = null;
        MERGING.set(board, false);
        preventTouchMove(board, event, false);
    };

    board.afterChange = () => {
        afterChange();
        if (handleG) {
            handleG.remove();
            handleG = null;
        }

        if (canRotate() && !isSelectionMoving(board)) {
            handleG = createG();
            if (needCustomActiveRectangle && rotateRef) {
                const boundingRectangle = getRectangleByElements(board, rotateRef.elements, false);
                const rotateHandleG = drawRotateHandle(board, boundingRectangle);
                if (isRotating(board)) {
                    const resizeHandleG = drawResizeHandleForElements(board, rotateRef.elements);
                    handleG && handleG.append(resizeHandleG);
                }
                handleG && handleG.append(rotateHandleG);
                if (rotateRef.angle) {
                    setAngleForG(handleG, RectangleClient.getCenterPoint(boundingRectangle), rotateRef.angle);
                }
            } else {
                const elements = getSelectedElements(board) as PlaitDrawElement[];
                const boundingRectangle = getRectangleByElements(board, elements, false);
                const rotateHandleG = drawRotateHandle(board, boundingRectangle);
                if (isRotating(board) && rotateRef) {
                    const resizeHandleG = drawResizeHandleForElements(board, rotateRef.elements);
                    handleG && handleG.append(resizeHandleG);
                }

                handleG && handleG.append(rotateHandleG);
                setAngleForG(handleG, RectangleClient.getCenterPoint(boundingRectangle), getSelectionAngle(elements));
            }
            PlaitBoard.getElementActiveHost(board).append(handleG);
        }
    };

    board.drawActiveRectangle = () => {
        if (needCustomActiveRectangle && rotateRef) {
            const rectangle = getRectangleByElements(board, rotateRef.elements, false);
            const rectangleG = drawRectangle(board, RectangleClient.inflate(rectangle, ACTIVE_STROKE_WIDTH), {
                stroke: SELECTION_BORDER_COLOR,
                strokeWidth: ACTIVE_STROKE_WIDTH
            });
            if (rotateRef.angle) {
                setAngleForG(rectangleG, RectangleClient.getCenterPoint(rectangle), rotateRef.angle);
            }
            return rectangleG;
        }
        return drawActiveRectangle();
    };

    return board;
};

export const drawResizeHandleForElements = (board: PlaitBoard, elements: PlaitElement[]) => {
    const handleG = createG();
    const rectangle = getRectangleByElements(board, elements, false);
    let corners = RectangleClient.getCornerPoints(rectangle);
    corners.forEach(corner => {
        const resizeHandle = drawHandle(board, corner);
        handleG && handleG.append(resizeHandle);
    });
    return handleG;
};
