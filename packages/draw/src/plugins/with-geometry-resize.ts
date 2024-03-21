import { Path, PlaitBoard, PlaitElement, Point, RectangleClient, Transforms, getSelectedElements, rotate, rotatePoints } from '@plait/core';
import { PlaitGeometry } from '../interfaces/geometry';
import {
    ResizeRef,
    ResizeState,
    WithResizeOptions,
    getFirstTextManage,
    isCornerHandle,
    normalizeShapePoints,
    withResize,
    resetPointsAfterResize
} from '@plait/common';
import { getSelectedGeometryElements, getSelectedImageElements } from '../utils/selected';
import { DrawTransforms } from '../transforms';
import { GeometryComponent } from '../geometry.component';
import { PlaitImage } from '../interfaces/image';
import { PlaitDrawElement } from '../interfaces';
import { getHitRectangleResizeHandleRef } from '../utils/position/geometry';
import { getResizeOriginPointAndHandlePoint } from './with-draw-resize';
import { getResizeAlignRef } from '../utils/resize-align';

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
                const handleRef = getHitRectangleResizeHandleRef(board, rectangle, point, target.angle);
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
            const centerPoint = RectangleClient.getCenterPoint(RectangleClient.getRectangleByPoints(resizeRef.element.points));
            const angle = resizeRef.element.angle;
            if (angle) {
                const [rotatedStartPoint, rotateEndPoint] = rotatePoints(
                    [resizeState.startPoint, resizeState.endPoint],
                    centerPoint,
                    -resizeRef.element.angle
                );
                resizeState.startPoint = rotatedStartPoint;
                resizeState.endPoint = rotateEndPoint;
            }

            alignG?.remove();
            const isFromCorner = isCornerHandle(board, resizeRef.handle);
            const isAspectRatio = resizeState.isShift || PlaitDrawElement.isImage(resizeRef.element);
            const { originPoint, handlePoint } = getResizeOriginPointAndHandlePoint(board, resizeRef);
            const resizeAlignRef = getResizeAlignRef(
                board,
                resizeRef,
                resizeState,
                {
                    originPoint,
                    handlePoint
                },
                isAspectRatio,
                isFromCorner
            );
            alignG = resizeAlignRef.alignG;
            PlaitBoard.getElementActiveHost(board).append(alignG);
            let points = resizeAlignRef.activePoints as [Point, Point];
            if (angle) {
                points = resetPointsAfterResize(
                    resizeRef.rectangle!,
                    RectangleClient.getRectangleByPoints(points),
                    centerPoint,
                    RectangleClient.getCenterPoint(RectangleClient.getRectangleByPoints(points)),
                    angle
                );
            }

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
