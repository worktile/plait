import { PlaitBoard, Point, RectangleClient, ResizeAlignReaction, ResizeAlignRef, getRectangleByElements, PlaitElement } from '@plait/core';
import { movePointByZoomAndOriginPoint } from '../plugins/with-draw-resize';
import { ResizeRef, getDirectionFactorByVectorComponent, getUnitVectorByPointAndPoint } from '@plait/common';
import { PlaitDrawElement } from '../interfaces';

export function getNormalizedResizeRef(
    board: PlaitBoard,
    resizeRef: ResizeRef<PlaitDrawElement | PlaitDrawElement[]>,
    resizeOriginPointAndHandlePoint: { originPoint: Point; handlePoint: Point },
    resizeZoom: { xZoom: number; yZoom: number },
    isMaintainAspectRatio: boolean
): ResizeAlignRef {
    const { originPoint, handlePoint } = resizeOriginPointAndHandlePoint;
    const { xZoom, yZoom } = resizeZoom;

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
