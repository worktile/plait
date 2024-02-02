import { PlaitBoard, Point, RectangleClient, ResizeAlignReaction, ResizeAlignRef, getRectangleByElements, PlaitElement } from '@plait/core';
import { getResizeOriginPointAndHandlePoint, getResizeZoom, movePointByZoomAndOriginPoint } from '../plugins/with-draw-resize';
import { ResizeRef, ResizeState, getUnitVectorByPointAndPoint, isCornerHandle } from '@plait/common';
import { PlaitDrawElement } from '../interfaces';

export function getResizeAlignRef(
    board: PlaitBoard,
    resizeRef: ResizeRef<PlaitDrawElement | PlaitDrawElement[]>,
    resizeState: ResizeState
): ResizeAlignRef {
    const isResizeFromCorner = isCornerHandle(board, resizeRef.handle);
    const isMaintainAspectRatio = resizeState.isShift || PlaitDrawElement.isImage(resizeRef.element);
    const { originPoint, handlePoint } = getResizeOriginPointAndHandlePoint(board, resizeRef);
    const { xZoom, yZoom } = getResizeZoom(resizeState, originPoint, handlePoint, isResizeFromCorner, isMaintainAspectRatio);

    let activeElements: PlaitElement[];
    let points: Point[] = [];
    if (Array.isArray(resizeRef.element)) {
        activeElements = resizeRef.element;
        const rectangle = getRectangleByElements(board, resizeRef.element, false);
        points = RectangleClient.getPoints(rectangle);
    } else {
        activeElements = [resizeRef.element];
        points = resizeRef.element.points;
    }

    const resizePoints = points.map(p => {
        return movePointByZoomAndOriginPoint(p, originPoint, xZoom, yZoom);
    }) as [Point, Point];
    const newRectangle = RectangleClient.getRectangleByPoints(resizePoints);
    const resizeAlignReaction = new ResizeAlignReaction(board, activeElements, newRectangle);

    const resizeHandlePoint = movePointByZoomAndOriginPoint(handlePoint, originPoint, xZoom, yZoom);
    const [x, y] = getUnitVectorByPointAndPoint(originPoint, resizeHandlePoint);
    const vectorFactor = [x === 0 ? x : x / Math.abs(x), y === 0 ? y : y / Math.abs(y)];
    let { deltaWidth, deltaHeight, g } = resizeAlignReaction.handleAlign(vectorFactor);
    return {
        deltaWidth,
        deltaHeight,
        g
    };
}
