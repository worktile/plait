import { PlaitBoard, Point, RectangleClient, getRectangleByElements, PlaitElement, DirectionFactor } from '@plait/core';
import { getResizeZoom, movePointByZoomAndOriginPoint } from '../plugins/with-draw-resize';
import { ResizeRef, ResizeState, getDirectionFactorByDirectionComponent, getUnitVectorByPointAndPoint } from '@plait/common';
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
    let resizeOriginPoints: Point[] = [];
    if (Array.isArray(resizeRef.element)) {
        activeElements = resizeRef.element;
        const rectangle = getRectangleByElements(board, resizeRef.element, false);
        resizeOriginPoints = RectangleClient.getPoints(rectangle);
    } else {
        activeElements = [resizeRef.element];
        resizeOriginPoints = resizeRef.element.points;
    }

    const points = resizeOriginPoints.map(p => {
        return movePointByZoomAndOriginPoint(p, originPoint, xZoom, yZoom);
    }) as [Point, Point];
    const activeRectangle = RectangleClient.getRectangleByPoints(points);

    const resizeAlignReaction = new ResizeAlignReaction(board, activeElements);
    const resizeHandlePoint = movePointByZoomAndOriginPoint(handlePoint, originPoint, xZoom, yZoom);
    const [x, y] = getUnitVectorByPointAndPoint(originPoint, resizeHandlePoint);

    return resizeAlignReaction.handleResizeAlign({
        resizeState,
        resizeOriginPoints,
        activeRectangle,
        originPoint,
        handlePoint,
        directionFactors: [getDirectionFactorByDirectionComponent(x), getDirectionFactorByDirectionComponent(y)],
        isAspectRatio,
        isFromCorner
    });
}
