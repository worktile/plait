import { PlaitBoard, Point, ResizeAlignDirection, RectangleClient, ResizeAlignReaction, ResizeAlignRef, getRectangleByElements } from '@plait/core';
import { getResizeOriginAndZoom, getResizeUnitVector, movePointByZoomAndOriginPoint } from '../plugins/with-draw-resize';
import { ResizeRef, ResizeState, isCornerHandle } from '@plait/common';
import { PlaitDrawElement } from '../interfaces';

export function getResizeAlignRef(board: PlaitBoard, resizeRef: ResizeRef<PlaitDrawElement | PlaitDrawElement[]>,resizeState: ResizeState): ResizeAlignRef {
    const isResizeFromCorner = isCornerHandle(board, resizeRef.handle);
    const isMaintainAspectRatio = resizeState.isShift || PlaitDrawElement.isImage(resizeRef.element);
    let result = getResizeOriginAndZoom(board, resizeRef, resizeState, isResizeFromCorner, isMaintainAspectRatio);
    let activeElements;
    let points: Point[] = [];
    if(Array.isArray(resizeRef.element)){
        const rectangle = getRectangleByElements(board, resizeRef.element, false);
        activeElements = resizeRef.element;
        points = RectangleClient.getPoints(rectangle)
    } else {
        activeElements = [resizeRef.element];
        points = resizeRef.element.points;
    }
    
    let resizePoints = points.map(p => {
        return movePointByZoomAndOriginPoint(p, result.originPoint, result.xZoom, result.yZoom);
    }) as [Point, Point];
    
    const newRectangle = RectangleClient.getRectangleByPoints(resizePoints);
    const resizeAlignReaction = new ResizeAlignReaction(board, activeElements, newRectangle);
    const [x, y] = getResizeUnitVector(board, resizeRef);
    let direction: ResizeAlignDirection | null = null;
    if(y === 0 && Math.abs(x) === 1){
        direction = ResizeAlignDirection.x
    }
    if(x === 0 && Math.abs(y) === 1){
        direction = ResizeAlignDirection.y
    }
    const isHr = (y === 0 && Math.abs(x) === 1) ? 'horizontal': 'vertical';
    let { deltaWidth, deltaHeight, g } = resizeAlignReaction.handleAlign(direction);
    deltaWidth = x === 0 ? deltaWidth : (x / Math.abs(x)) * deltaWidth;
    deltaHeight = y === 0 ? deltaHeight : (y / Math.abs(y)) * deltaHeight;
    return {
        deltaWidth,
        deltaHeight,
        g
    };
}
