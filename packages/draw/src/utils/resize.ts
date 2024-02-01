import { PlaitBoard, Point, RectangleClient, ResizeAlignReaction, ResizeAlignRef, getRectangleByElements, PlaitElement } from '@plait/core';
import { getResizeOriginAndZoom, movePointByZoomAndOriginPoint } from '../plugins/with-draw-resize';
import { ResizeRef, ResizeState, isCornerHandle } from '@plait/common';
import { PlaitDrawElement } from '../interfaces';

export function getResizeAlignRef(
    board: PlaitBoard,
    resizeRef: ResizeRef<PlaitDrawElement | PlaitDrawElement[]>,
    resizeState: ResizeState
): ResizeAlignRef {
    const isResizeFromCorner = isCornerHandle(board, resizeRef.handle);
    const isMaintainAspectRatio = resizeState.isShift || PlaitDrawElement.isImage(resizeRef.element);
    let result = getResizeOriginAndZoom(board, resizeRef, resizeState, isResizeFromCorner, isMaintainAspectRatio);
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
        return movePointByZoomAndOriginPoint(p, result.originPoint, result.xZoom, result.yZoom);
    }) as [Point, Point];
    const newRectangle = RectangleClient.getRectangleByPoints(resizePoints);
    const resizeAlignReaction = new ResizeAlignReaction(board, activeElements, newRectangle);

    const [x, y] = result.unitVector;
    const vectorFactor = [x === 0 ? x : x / Math.abs(x), y === 0 ? y : y / Math.abs(y)];
    let { deltaWidth, deltaHeight, g } = resizeAlignReaction.handleAlign(vectorFactor);
    return {
        deltaWidth,
        deltaHeight,
        g
    };
}
