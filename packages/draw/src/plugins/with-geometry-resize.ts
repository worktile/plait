import {
    Path,
    PlaitBoard,
    PlaitElement,
    Point,
    RectangleClient,
    ResizeAlignReaction,
    Transforms,
    getSelectedElements
} from '@plait/core';
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
import { getResizeOriginAndZoom, movePointByZoomAndOriginPoint } from './with-draw-resize';

export const withGeometryResize = (board: PlaitBoard) => {
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
            const isResizeFromCorner = isCornerHandle(board, resizeRef.handle);
            const isMaintainAspectRatio = resizeState.isShift || PlaitDrawElement.isImage(resizeRef.element);
            const result = getResizeOriginAndZoom(board, resizeRef, resizeState, isResizeFromCorner, isMaintainAspectRatio);
            let points = resizeRef.element.points.map(p => {
                return movePointByZoomAndOriginPoint(p, result.originPoint, result.xZoom, result.yZoom);
            }) as [Point, Point];
            const newRectangle = {
                x: points[0][0],
                y: points[0][1],
                width: Math.abs(points[1][0] - points[0][0]),
                height: Math.abs(points[1][1] - points[0][1])
            };
            const resizeAlignReaction = new ResizeAlignReaction(board, [resizeRef.element], newRectangle);
            const { deltaX, deltaY } = resizeAlignReaction.handleAlign();
            // TODO: 根据 resize 的方向修改 points 中的数据
            points = [points[0], [points[1][0] - deltaX, points[1][1] - deltaY]];
            if (PlaitDrawElement.isGeometry(resizeRef.element)) {
                const { height: textHeight } = getFirstTextManage(resizeRef.element).getSize();
                DrawTransforms.resizeGeometry(board, points, textHeight, resizeRef.path as Path);
            } else {
                points = normalizeShapePoints(points);
                Transforms.setNode(board, { points }, resizeRef.path as Path);
            }
        }
    };

    withResize<PlaitGeometry | PlaitImage>(board, options);

    return board;
};
