import { PlaitBoard, PlaitElement, Point, Transforms, getSelectedElements } from '@plait/core';
import { PlaitGeometry } from '../interfaces/geometry';
import {
    ResizeHandle,
    ResizeRef,
    ResizeState,
    WithResizeOptions,
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
            if (resizeRef.handle === ResizeHandle.nw) {
                points = [resizeState.endTransformPoint, resizeRef.element.points[1]];
            }
            if (resizeRef.handle === ResizeHandle.ne) {
                points = [resizeState.endTransformPoint, [resizeRef.element.points[0][0], resizeRef.element.points[1][1]]];
            }
            if (resizeRef.handle === ResizeHandle.se) {
                points = [resizeState.endTransformPoint, resizeRef.element.points[0]];
            }
            if (resizeRef.handle === ResizeHandle.sw) {
                points = [resizeState.endTransformPoint, [resizeRef.element.points[1][0], resizeRef.element.points[0][1]]];
            }
            if (isShift || PlaitDrawElement.isImage(resizeRef.element)) {
                const rectangle = getRectangleByPoints(points);
                const factor = points[0][1] > points[1][1] ? 1 : -1;
                const height = rectangle.width * ratio * factor;
                points = [[resizeState.endTransformPoint[0], points[1][1] + height], points[1]];
            }
            if (PlaitDrawElement.isGeometry(resizeRef.element)) {
                const { height: textHeight } = PlaitGeometry.getTextManage(resizeRef.element).getSize();
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
