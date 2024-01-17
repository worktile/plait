import {
    ResizeHandle,
    ResizeRef,
    ResizeState,
    WithResizeOptions,
    getFirstTextManage,
    getIndexByResizeHandle,
    getPointByUnitVectorAndVectorComponent,
    getRectangleByPoints,
    getResizeHandlePointByIndex,
    getSymmetricHandleIndex,
    getUnitVectorByPointAndPoint,
    isCornerHandle,
    withResize
} from '@plait/common';
import { PlaitBoard, Point, RectangleClient, Transforms, getRectangleByElements, getSelectedElements } from '@plait/core';
import { PlaitDrawElement } from '../interfaces';
import { DrawTransforms } from '../transforms';
import { getHitRectangleResizeHandleRef } from '../utils/position/geometry';
import { isKeyHotkey } from 'is-hotkey';

export function withSelectionResize(board: PlaitBoard) {
    const { afterChange } = board;

    const { keyDown, keyUp } = board;

    let isShift = false;

    board.keyDown = (event: KeyboardEvent) => {
        isShift = isKeyHotkey('shift', event);
        keyDown(event);
    };

    board.keyUp = (event: KeyboardEvent) => {
        isShift = false;
        keyUp(event);
    };

    const options: WithResizeOptions<PlaitDrawElement> = {
        key: 'draw-elements',
        canResize: () => {
            const elements = getSelectedElements(board);
            return elements.length > 1 && elements.every(el => PlaitDrawElement.isDrawElement(el));
        },
        detect: (point: Point) => {
            const elements = getSelectedElements(board) as PlaitDrawElement[];
            const boundingRectangle = getRectangleByElements(board, elements, false);
            const handleRef = getHitRectangleResizeHandleRef(board, boundingRectangle, point);
            if (handleRef) {
                return {
                    element: elements[0],
                    elements: elements,
                    rectangle: boundingRectangle,
                    handle: handleRef.handle,
                    cursorClass: handleRef.cursorClass
                };
            }
            return null;
        },
        onResize: (resizeRef: ResizeRef<PlaitDrawElement>, resizeState: ResizeState) => {
            const handleIndex = getIndexByResizeHandle(resizeRef.handle);
            const symmetricHandleIndex = getSymmetricHandleIndex(board, handleIndex);
            const resizeOriginPoint = getResizeHandlePointByIndex(resizeRef.rectangle as RectangleClient, symmetricHandleIndex);
            const resizeHandlePoint = getResizeHandlePointByIndex(resizeRef.rectangle as RectangleClient, handleIndex);
            const unitVector = getUnitVectorByPointAndPoint(resizeOriginPoint, resizeHandlePoint);
            const startPoint = resizeState.startPoint as Point;
            let endPoint = resizeState.endPoint as Point;
            let offsetX = Point.getOffsetX(startPoint, endPoint);
            let xZoom = 0;
            let yZoom = 0;
            const isResizeFromCorner = isCornerHandle(board, resizeRef.handle);
            const isMaintainAspectRatio = isShift || isResizeFromCorner;
            if (isResizeFromCorner) {
                endPoint = getPointByUnitVectorAndVectorComponent(startPoint, unitVector, offsetX, true);
                let normalizedOffsetX = Point.getOffsetX(startPoint, endPoint);
                let normalizedOffsetY = Point.getOffsetY(startPoint, endPoint);
                xZoom = normalizedOffsetX / (resizeHandlePoint[0] - resizeOriginPoint[0]);
                yZoom = normalizedOffsetY / (resizeHandlePoint[1] - resizeOriginPoint[1]);
            } else {
                const isHorizontal = Point.isHorizontalAlign(resizeOriginPoint, resizeHandlePoint, 0.1) || false;
                let normalizedOffset = isHorizontal ? Point.getOffsetX(startPoint, endPoint) : Point.getOffsetY(startPoint, endPoint);
                let benchmarkOffset = isHorizontal
                    ? resizeHandlePoint[0] - resizeOriginPoint[0]
                    : resizeHandlePoint[1] - resizeOriginPoint[1];
                const zoom = normalizedOffset / benchmarkOffset;
                if (isShift) {
                    xZoom = zoom;
                    yZoom = zoom;
                } else {
                    if (isHorizontal) {
                        xZoom = zoom;
                    } else {
                        yZoom = zoom;
                    }
                }
            }
            const movePointByZoomAndOriginPoint = (p: Point) => {
                const offsetX = (p[0] - resizeOriginPoint[0]) * xZoom;
                const offsetY = (p[1] - resizeOriginPoint[1]) * yZoom;
                return [p[0] + offsetX, p[1] + offsetY] as Point;
            };
            resizeRef.elements!.forEach(target => {
                const path = PlaitBoard.findPath(board, target);
                let points = target.points.map(p => {
                    return movePointByZoomAndOriginPoint(p);
                });
                if (PlaitDrawElement.isGeometry(target)) {
                    const { height: textHeight } = getFirstTextManage(target).getSize();
                    DrawTransforms.resizeGeometry(board, points as [Point, Point], textHeight, path);
                } else if (PlaitDrawElement.isLine(target)) {
                    Transforms.setNode(board, { points }, path);
                } else if (PlaitDrawElement.isImage(target)) {
                    if (isMaintainAspectRatio) {
                        Transforms.setNode(board, { points }, path);
                    } else {
                        // The image element does not follow the resize, but moves based on the center point.
                        const targetRectangle = getRectangleByPoints(target.points);
                        const centerPoint = RectangleClient.getCenterPoint(targetRectangle);
                        const newCenterPoint = movePointByZoomAndOriginPoint(centerPoint);
                        const newTargetRectangle = RectangleClient.createRectangleByCenterPoint(
                            newCenterPoint,
                            targetRectangle.width,
                            targetRectangle.height
                        );
                        Transforms.setNode(board, { points: RectangleClient.getPoints(newTargetRectangle) }, path);
                    }
                }
            });
        }
    };

    withResize<PlaitDrawElement>(board, options);

    board.afterChange = () => {
        afterChange();
    };

    return board;
}

const getPointsByResizeHandle = (movingPoint: Point, elementPoints: Point[], handle: ResizeHandle): [Point, Point] => {
    switch (handle) {
        case ResizeHandle.nw: {
            return [movingPoint, elementPoints[1]];
        }
        case ResizeHandle.ne: {
            return [movingPoint, [elementPoints[0][0], elementPoints[1][1]]];
        }
        case ResizeHandle.se: {
            return [movingPoint, elementPoints[0]];
        }
        case ResizeHandle.sw: {
            return [movingPoint, [elementPoints[1][0], elementPoints[0][1]]];
        }
        case ResizeHandle.n: {
            return [[elementPoints[0][0], movingPoint[1]], elementPoints[1]];
        }
        case ResizeHandle.s: {
            return [elementPoints[0], [elementPoints[1][0], movingPoint[1]]];
        }
        case ResizeHandle.w: {
            return [[movingPoint[0], elementPoints[0][1]], elementPoints[1]];
        }
        default: {
            return [elementPoints[0], [movingPoint[0], elementPoints[1][1]]];
        }
    }
};
