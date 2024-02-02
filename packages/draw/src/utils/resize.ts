import { PlaitBoard, Point, RectangleClient, getRectangleByElements, PlaitElement } from '@plait/core';
import { getResizeOriginPointAndHandlePoint, getResizeZoom, movePointByZoomAndOriginPoint } from '../plugins/with-draw-resize';
import { ResizeRef, ResizeState, getDirectionFactorByVectorComponent, getUnitVectorByPointAndPoint } from '@plait/common';
import { PlaitDrawElement } from '../interfaces';
import { ResizeAlignReaction, ResizeAlignRef } from './resize-align-reaction';

export function getResizeAlignRef(
    board: PlaitBoard,
    resizeRef: ResizeRef<PlaitDrawElement | PlaitDrawElement[]>,
    resizeState: ResizeState,
    isMaintainAspectRatio: boolean,
    isResizeFromCorner: boolean
): ResizeAlignRef {
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

    let { deltaWidth, deltaHeight, g } = resizeAlignReaction.handleAlign({
        resizeDirectionFactors: [getDirectionFactorByVectorComponent(x), getDirectionFactorByVectorComponent(y)],
        isMaintainAspectRatio
    });
    return {
        deltaWidth,
        deltaHeight,
        g
    };
}
