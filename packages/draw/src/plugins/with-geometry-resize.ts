import { Path, PlaitBoard, PlaitElement, Point, RectangleClient, Transforms, getSelectedElements } from '@plait/core';
import { PlaitGeometry } from '../interfaces/geometry';
import {
    ResizeRef,
    ResizeState,
    WithResizeOptions,
    getFirstTextManage,
    isCornerHandle,
    normalizeShapePoints,
    withResize
} from '@plait/common';
import { getSelectedGeometryElements, getSelectedImageElements } from '../utils/selected';
import { DrawTransforms } from '../transforms';
import { GeometryComponent } from '../geometry.component';
import { PlaitImage } from '../interfaces/image';
import { PlaitDrawElement } from '../interfaces';
import { getHitRectangleResizeHandleRef } from '../utils/position/geometry';
import { getResizeOriginPointAndHandlePoint, getResizeZoom, movePointByZoomAndOriginPoint } from './with-draw-resize';
import { getResizeAlignRef } from '../utils/resize';

export const withGeometryResize = (board: PlaitBoard) => {
    let alignG: SVGGElement | null;
    const options: WithResizeOptions<PlaitGeometry | PlaitImage> = {
        key: 'draw-geometry',
        canResize: () => {
            return true;
        },
        hitTest: (point: Point) => {
            const selectedElements = [...getSelectedGeometryElements(board), ...getSelectedImageElements(board)];
            if (selectedElements.length !== 1 || getSelectedElements(board).length !== 1) {
                return null;
            }
            const target = selectedElements[0];
            const targetComponent = PlaitElement.getComponent(selectedElements[0]) as GeometryComponent;
            if (targetComponent.activeGenerator.hasResizeHandle) {
                const rectangle = board.getRectangle(target) as RectangleClient;
                const handleRef = getHitRectangleResizeHandleRef(board, rectangle, point);
                if (handleRef) {
                    return {
                        element: target,
                        handle: handleRef.handle,
                        cursorClass: handleRef.cursorClass,
                        rectangle
                    };
                }
            }
            return null;
        },
        onResize: (resizeRef: ResizeRef<PlaitGeometry | PlaitImage>, resizeState: ResizeState) => {
            alignG?.remove();
            const isResizeFromCorner = isCornerHandle(board, resizeRef.handle);
            const isMaintainAspectRatio = resizeState.isShift || PlaitDrawElement.isImage(resizeRef.element);
            const { originPoint, handlePoint } = getResizeOriginPointAndHandlePoint(board, resizeRef);

            const { deltaWidth, deltaHeight, equalLinesG } = getResizeAlignRef(
                board,
                resizeRef,
                resizeState,
                {
                    originPoint,
                    handlePoint
                },
                isMaintainAspectRatio,
                isResizeFromCorner
            );
            alignG = equalLinesG;
            PlaitBoard.getElementActiveHost(board).append(alignG);
            const newResizeState: ResizeState = {
                ...resizeState,
                endPoint: [resizeState.endPoint[0] + deltaWidth, resizeState.endPoint[1] + deltaHeight]
            };
            const { xZoom, yZoom } = getResizeZoom(newResizeState, originPoint, handlePoint, isResizeFromCorner, isMaintainAspectRatio);
            let points = resizeRef.element.points.map(p => {
                return movePointByZoomAndOriginPoint(p, originPoint, xZoom, yZoom);
            }) as [Point, Point];
            if (PlaitDrawElement.isGeometry(resizeRef.element)) {
                const { height: textHeight } = getFirstTextManage(resizeRef.element).getSize();
                DrawTransforms.resizeGeometry(board, points, textHeight, resizeRef.path as Path);
            } else {
                points = normalizeShapePoints(points);
                Transforms.setNode(board, { points }, resizeRef.path as Path);
            }
        },
        afterResize: (resizeRef: ResizeRef<PlaitGeometry | PlaitImage>) => {
            alignG?.remove();
            alignG = null;
        }
    };

    withResize<PlaitGeometry | PlaitImage>(board, options);

    return board;
};
