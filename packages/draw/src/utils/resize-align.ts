import { PlaitBoard, Point, RectangleClient, getRectangleByElements, PlaitElement } from '@plait/core';
import { getResizeZoom, movePointByZoomAndOriginPoint } from '../plugins/with-draw-resize';
import { ResizeRef, ResizeState, getDirectionFactorByVectorComponent, getUnitVectorByPointAndPoint } from '@plait/common';
import { PlaitDrawElement } from '../interfaces';
import { ResizeAlignReaction, ResizeAlignRef } from './resize-align-reaction';

export function getResizeAlignRef(
    board: PlaitBoard,
    resizeRef: ResizeRef<PlaitDrawElement | PlaitDrawElement[]>,
    resizeState: ResizeState,
    resizeOriginPointAndHandlePoint: {
        originPoint: Point;
        handlePoint: Point;
    },
    isAspectRatio: boolean,
    isFromCorner: boolean
): ResizeAlignRef {
    const { originPoint, handlePoint } = resizeOriginPointAndHandlePoint;
    const { xZoom, yZoom } = getResizeZoom(resizeState, originPoint, handlePoint, isFromCorner, isAspectRatio);

    let activeElements: PlaitElement[];
    let resizePoints: Point[] = [];
    if (Array.isArray(resizeRef.element)) {
        activeElements = resizeRef.element;
        const rectangle = getRectangleByElements(board, resizeRef.element, false);
        resizePoints = RectangleClient.getPoints(rectangle);
    } else {
        activeElements = [resizeRef.element];
        resizePoints = resizeRef.element.points;
    }

    const points = resizePoints.map(p => {
        return movePointByZoomAndOriginPoint(p, originPoint, xZoom, yZoom);
    }) as [Point, Point];
    const newRectangle = RectangleClient.getRectangleByPoints(points);
    const resizeAlignReaction = new ResizeAlignReaction(board, activeElements, newRectangle);

    const resizeHandlePoint = movePointByZoomAndOriginPoint(handlePoint, originPoint, xZoom, yZoom);
    const [x, y] = getUnitVectorByPointAndPoint(originPoint, resizeHandlePoint);

    return resizeAlignReaction.handleResizeAlign({
        resizeState,
        resizePoints,
        originPoint,
        handlePoint,
        directionFactors: [getDirectionFactorByVectorComponent(x), getDirectionFactorByVectorComponent(y)],
        isAspectRatio,
        isFromCorner
    });
}
