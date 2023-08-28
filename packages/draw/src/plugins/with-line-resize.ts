import { PlaitBoard, Point } from '@plait/core';
import { PlaitGeometry } from '../interfaces/geometry';
import { ResizeRef, ResizeState, WithResizeOptions, withResize } from '@plait/common';
import { getSelectedLineElements } from '../utils/selected';
import { DrawTransforms } from '../transforms';
import { getHitLineResizeHandleRef, LineResizeHandle } from '../utils/position/line';

export const withLineResize = (board: PlaitBoard) => {
    const options: WithResizeOptions<PlaitGeometry, LineResizeHandle> = {
        key: 'draw-line',
        canResize: () => {
            return true;
        },
        detect: (point: Point) => {
            const selectedLineElements = getSelectedLineElements(board);
            if (selectedLineElements.length > 0) {
                let result = null;
                selectedLineElements.forEach(value => {
                    const handleRef = getHitLineResizeHandleRef(board, value, point);
                    if (handleRef) {
                        result = {
                            element: value,
                            handle: handleRef.handle
                        };
                    }
                });
                return result;
            }
            return null;
        },
        onResize: (resizeRef: ResizeRef<PlaitGeometry, LineResizeHandle>, resizeState: ResizeState) => {
            let points: [Point, Point] = [...resizeRef.element.points];
            if (resizeRef.handle === LineResizeHandle.source) {
                points[0] = resizeState.endTransformPoint;
            }
            if (resizeRef.handle === LineResizeHandle.target) {
                points[1] = resizeState.endTransformPoint;
            }
            DrawTransforms.resizeLine(board, points, resizeRef.path);
        }
    };

    withResize<PlaitGeometry, LineResizeHandle>(board, options);

    return board;
};
