import { PlaitBoard, PlaitElement, Point, RectangleClient, Transforms, getSelectedElements } from '@plait/core';
import { PlaitGeometry } from '../interfaces/geometry';
import {
    ResizeHandle,
    ResizeRef,
    ResizeState,
    WithResizeOptions,
    getFirstTextManage,
    getRectangleByPoints,
    normalizeShapePoints,
    withResize
} from '@plait/common';
import { getSelectedGeometryElements, getSelectedImageElements } from '../utils/selected';
import { getHitGeometryResizeHandleRef } from '../utils/position/geometry';
import { DrawTransforms } from '../transforms';
import { isKeyHotkey } from 'is-hotkey';
import { GeometryComponent } from '../geometry.component';
import { PlaitImage } from '../interfaces/image';
import { PlaitDrawElement } from '../interfaces';

export const withGeometryResize = (board: PlaitBoard) => {
    const { keydown, keyup } = board;

    let isShift = false;

    board.keydown = (event: KeyboardEvent) => {
        isShift = isKeyHotkey('shift', event);
        keydown(event);
    };

    board.keyup = (event: KeyboardEvent) => {
        isShift = false;
        keyup(event);
    };

    const options: WithResizeOptions<PlaitGeometry | PlaitImage> = {
        key: 'draw-geometry',
        canResize: () => {
            return true;
        },
        detect: (point: Point) => {
            const selectedElements = [...getSelectedGeometryElements(board), ...getSelectedImageElements(board)];
            if (selectedElements.length !== 1 || getSelectedElements(board).length !== 1) {
                return null;
            }
            const target = selectedElements[0];
            const targetComponent = PlaitElement.getComponent(selectedElements[0]) as GeometryComponent;
            if (targetComponent.activeGenerator.hasResizeHandle) {
                const handleRef = getHitGeometryResizeHandleRef(board, target, point);
                if (handleRef) {
                    return {
                        element: target,
                        handle: handleRef.handle,
                        cursorClass: handleRef.cursorClass
                    };
                }
            }
            return null;
        },
        onResize: (resizeRef: ResizeRef<PlaitGeometry | PlaitImage>, resizeState: ResizeState) => {
            let points: [Point, Point] = [...resizeRef.element.points];
            const rectangle = getRectangleByPoints(resizeRef.element.points);
            const ratio = rectangle.height / rectangle.width;
            const isCornerHandle = [ResizeHandle.nw, ResizeHandle.ne, ResizeHandle.se, ResizeHandle.sw].includes(resizeRef.handle);
            points = getPointsByResizeHandle(resizeState.endTransformPoint, resizeRef.element.points, resizeRef.handle);
            if ((isShift || PlaitDrawElement.isImage(resizeRef.element)) && isCornerHandle) {
                const rectangle = getRectangleByPoints(points);
                const factor = points[0][1] > points[1][1] ? 1 : -1;
                const height = rectangle.width * ratio * factor;
                points = [[resizeState.endTransformPoint[0], points[1][1] + height], points[1]];
            }
            if ((isShift || PlaitDrawElement.isImage(resizeRef.element)) && !isCornerHandle) {
                const rectangle = getRectangleByPoints(points);
                if (resizeRef.handle === ResizeHandle.n || resizeRef.handle === ResizeHandle.s) {
                    const newWidth = rectangle.height / ratio;
                    const offset = (newWidth - rectangle.width) / 2;
                    const newRectangle = RectangleClient.expand(rectangle, offset, 0);
                    const cornerPoints = RectangleClient.getCornerPoints(newRectangle);
                    points = [cornerPoints[0], cornerPoints[2]];
                }
                if (resizeRef.handle === ResizeHandle.e || resizeRef.handle === ResizeHandle.w) {
                    const newHeight = rectangle.width * ratio;
                    const offset = (newHeight - rectangle.height) / 2;
                    const newRectangle = RectangleClient.expand(rectangle, 0, offset);
                    const cornerPoints = RectangleClient.getCornerPoints(newRectangle);
                    points = [cornerPoints[0], cornerPoints[2]];
                }
            }
            if (PlaitDrawElement.isGeometry(resizeRef.element)) {
                const { height: textHeight } = getFirstTextManage(resizeRef.element).getSize();
                DrawTransforms.resizeGeometry(board, points, textHeight, resizeRef.path);
            } else {
                points = normalizeShapePoints(points);
                Transforms.setNode(board, { points }, resizeRef.path);
            }
        }
    };

    withResize<PlaitGeometry | PlaitImage>(board, options);

    return board;
};

const getPointsByResizeHandle = (movingPoint: Point, elementPoints: Point[], handle: ResizeHandle): [Point, Point] => {
    switch (handle) {
        case ResizeHandle.nw: {
            return [movingPoint, elementPoints[1]];
        }
        case ResizeHandle.ne: {
            return [movingPoint, [elementPoints[0][0], elementPoints[1][1]]];
        }
        case ResizeHandle.se: {
            return [movingPoint, elementPoints[0]];
        }
        case ResizeHandle.sw: {
            return [movingPoint, [elementPoints[1][0], elementPoints[0][1]]];
        }
        case ResizeHandle.n: {
            return [[elementPoints[0][0], movingPoint[1]], elementPoints[1]];
        }
        case ResizeHandle.s: {
            return [elementPoints[0], [elementPoints[1][0], movingPoint[1]]];
        }
        case ResizeHandle.w: {
            return [[movingPoint[0], elementPoints[0][1]], elementPoints[1]];
        }
        default: {
            return [elementPoints[0], [movingPoint[0], elementPoints[1][1]]];
        }
    }
};
