import { PlaitBoard, Point } from '@plait/core';
import { PlaitGeometry } from '../interfaces/geometry';
import { ResizeHandle, ResizeRef, ResizeState, WithResizeOptions, normalizeShapePoints, withResize } from '@plait/common';
import { getSelectedGeometryElements } from '../utils/selected';
import { getHitGeometryResizeHandleRef } from '../utils/position/geometry';
import { DrawTransforms } from '../transforms';
import { isKeyHotkey } from 'is-hotkey';

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

    const options: WithResizeOptions<PlaitGeometry> = {
        key: 'draw-geometry',
        canResize: () => {
            return true;
        },
        detect: (point: Point) => {
            const selectedGeometryElements = getSelectedGeometryElements(board);
            if (selectedGeometryElements.length > 0) {
                let result = null;
                selectedGeometryElements.forEach(value => {
                    const handleRef = getHitGeometryResizeHandleRef(board, value, point);
                    if (handleRef) {
                        result = {
                            element: value,
                            handle: handleRef.handle,
                            cursorClass: handleRef.cursorClass
                        };
                    }
                });
                return result;
            }
            return null;
        },
        onResize: (resizeRef: ResizeRef<PlaitGeometry>, resizeState: ResizeState) => {
            let points: [Point, Point] = [...resizeRef.element.points];
            if (resizeRef.handle === ResizeHandle.nw) {
                points = [resizeState.endTransformPoint, resizeRef.element.points[1]];
            }
            if (resizeRef.handle === ResizeHandle.ne) {
                points = [
                    [resizeRef.element.points[0][0], resizeState.endTransformPoint[1]],
                    [resizeState.endTransformPoint[0], resizeRef.element.points[1][1]]
                ];
            }
            if (resizeRef.handle === ResizeHandle.se) {
                points = [resizeRef.element.points[0], resizeState.endTransformPoint];
            }
            if (resizeRef.handle === ResizeHandle.sw) {
                points = [
                    [resizeState.endTransformPoint[0], resizeRef.element.points[0][1]],
                    [resizeRef.element.points[1][0], resizeState.endTransformPoint[1]]
                ];
            }
            points = normalizeShapePoints(points, isShift);
            DrawTransforms.resizeGeometry(board, points, resizeRef.path);
        }
    };

    withResize<PlaitGeometry>(board, options);

    return board;
};
