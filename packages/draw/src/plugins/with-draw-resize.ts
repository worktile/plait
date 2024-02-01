import {
    ResizeRef,
    ResizeState,
    WithResizeOptions,
    getFirstTextManage,
    getIndexByResizeHandle,
    getPointByUnitVectorAndVectorComponent,
    getResizeHandlePointByIndex,
    getSymmetricHandleIndex,
    getUnitVectorByPointAndPoint,
    isCornerHandle,
    withResize
} from '@plait/common';
import {
    ACTIVE_MOVING_CLASS_NAME,
    PlaitBoard,
    Point,
    RectangleClient,
    ResizeAlignReaction,
    Transforms,
    getRectangleByElements,
    getSelectedElements
} from '@plait/core';
import { PlaitDrawElement } from '../interfaces';
import { DrawTransforms } from '../transforms';
import { getHitRectangleResizeHandleRef } from '../utils/position/geometry';
import { getResizeAlignRef } from '../utils/resize';

export function withDrawResize(board: PlaitBoard) {
    const { afterChange } = board;
    let alignG: SVGGElement | null;
    const options: WithResizeOptions<PlaitDrawElement[]> = {
        key: 'draw-elements',
        canResize: () => {
            const elements = getSelectedElements(board);
            return elements.length > 1 && elements.every(el => PlaitDrawElement.isDrawElement(el));
        },
        hitTest: (point: Point) => {
            const elements = getSelectedElements(board) as PlaitDrawElement[];
            const boundingRectangle = getRectangleByElements(board, elements, false);
            const handleRef = getHitRectangleResizeHandleRef(board, boundingRectangle, point);
            if (handleRef) {
                return {
                    element: elements,
                    rectangle: boundingRectangle,
                    handle: handleRef.handle,
                    cursorClass: handleRef.cursorClass
                };
            }
            return null;
        },
        onResize: (resizeRef: ResizeRef<PlaitDrawElement[]>, resizeState: ResizeState) => {
            alignG?.remove();
            const { deltaWidth, deltaHeight, g } = getResizeAlignRef(board, resizeRef, resizeState)
            alignG = g;
            alignG.classList.add(ACTIVE_MOVING_CLASS_NAME);
            PlaitBoard.getElementActiveHost(board).append(alignG);
            resizeState.endPoint = [resizeState.endPoint[0] - deltaWidth, resizeState.endPoint[1] - deltaHeight];
           
            const isResizeFromCorner = isCornerHandle(board, resizeRef.handle);
            const isMaintainAspectRatio = resizeState.isShift || isResizeFromCorner;
            const result = getResizeOriginAndZoom(board, resizeRef, resizeState, isResizeFromCorner, isMaintainAspectRatio);
            resizeRef.element.forEach(target => {
                const path = PlaitBoard.findPath(board, target);
                let points = target.points.map(p => {
                    return movePointByZoomAndOriginPoint(p, result.originPoint, result.xZoom, result.yZoom);
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
                        const targetRectangle = RectangleClient.getRectangleByPoints(target.points);
                        const centerPoint = RectangleClient.getCenterPoint(targetRectangle);
                        const newCenterPoint = movePointByZoomAndOriginPoint(centerPoint, result.originPoint, result.xZoom, result.yZoom);
                        const newTargetRectangle = RectangleClient.getRectangleByCenterPoint(
                            newCenterPoint,
                            targetRectangle.width,
                            targetRectangle.height
                        );
                        Transforms.setNode(board, { points: RectangleClient.getPoints(newTargetRectangle) }, path);
                    }
                }
            });
        },
        afterResize: (resizeRef: ResizeRef<PlaitDrawElement[]>) => {
            alignG?.remove();
            alignG = null;
        }
    };

    withResize<PlaitDrawElement[]>(board, options);

    board.afterChange = () => {
        afterChange();
    };

    return board;
}

export const getResizeUnitVector = (board: PlaitBoard, resizeRef: ResizeRef<PlaitDrawElement | PlaitDrawElement[]>) => {
    const handleIndex = getIndexByResizeHandle(resizeRef.handle);
    const symmetricHandleIndex = getSymmetricHandleIndex(board, handleIndex);
    const resizeOriginPoint = getResizeHandlePointByIndex(resizeRef.rectangle as RectangleClient, symmetricHandleIndex);
    const resizeHandlePoint = getResizeHandlePointByIndex(resizeRef.rectangle as RectangleClient, handleIndex);
    const unitVector = getUnitVectorByPointAndPoint(resizeOriginPoint, resizeHandlePoint);
    return unitVector;
};

export const getResizeOriginAndZoom = (
    board: PlaitBoard,
    resizeRef: ResizeRef<PlaitDrawElement | PlaitDrawElement[]>,
    resizeState: ResizeState,
    isResizeFromCorner: boolean,
    isMaintainAspectRatio: boolean
) => {
    const handleIndex = getIndexByResizeHandle(resizeRef.handle);
    const symmetricHandleIndex = getSymmetricHandleIndex(board, handleIndex);
    const resizeOriginPoint = getResizeHandlePointByIndex(resizeRef.rectangle as RectangleClient, symmetricHandleIndex);
    const resizeHandlePoint = getResizeHandlePointByIndex(resizeRef.rectangle as RectangleClient, handleIndex);
    const unitVector = getUnitVectorByPointAndPoint(resizeOriginPoint, resizeHandlePoint);
    const startPoint = resizeState.startPoint;
    let endPoint = resizeState.endPoint;
    let offsetX = Point.getOffsetX(startPoint, endPoint);
    let xZoom = 0;
    let yZoom = 0;
    if (isResizeFromCorner) {
        if (isMaintainAspectRatio) {
            endPoint = getPointByUnitVectorAndVectorComponent(startPoint, unitVector, offsetX, true);
        }
        let normalizedOffsetX = Point.getOffsetX(startPoint, endPoint);
        let normalizedOffsetY = Point.getOffsetY(startPoint, endPoint);
        xZoom = normalizedOffsetX / (resizeHandlePoint[0] - resizeOriginPoint[0]);
        yZoom = normalizedOffsetY / (resizeHandlePoint[1] - resizeOriginPoint[1]);
    } else {
        const isHorizontal = Point.isHorizontal(resizeOriginPoint, resizeHandlePoint, 0.1) || false;
        let normalizedOffset = isHorizontal ? Point.getOffsetX(startPoint, endPoint) : Point.getOffsetY(startPoint, endPoint);
        let benchmarkOffset = isHorizontal ? resizeHandlePoint[0] - resizeOriginPoint[0] : resizeHandlePoint[1] - resizeOriginPoint[1];
        const zoom = normalizedOffset / benchmarkOffset;
        if (resizeState.isShift) {
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
    return { xZoom, yZoom, originPoint: resizeOriginPoint };
};

export const movePointByZoomAndOriginPoint = (p: Point, resizeOriginPoint: Point, xZoom: number, yZoom: number) => {
    const offsetX = (p[0] - resizeOriginPoint[0]) * xZoom;
    const offsetY = (p[1] - resizeOriginPoint[1]) * yZoom;
    return [p[0] + offsetX, p[1] + offsetY] as Point;
};
