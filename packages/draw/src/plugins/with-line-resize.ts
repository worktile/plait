import { PlaitBoard, PlaitElement, Point } from '@plait/core';
import { ResizeRef, ResizeState, WithResizeOptions, withResize } from '@plait/common';
import { getSelectedLineElements } from '../utils/selected';
import { getHitLineResizeHandleRef, LineResizeHandle } from '../utils/position/line';
import { getHitOutlineGeometry } from '../utils/position/geometry';
import { LineHandle, PlaitLine } from '../interfaces';
import { transformPointToConnection } from '../utils';
import { DrawTransforms } from '../transforms';
import { LineComponent } from '../line.component';

export const withLineResize = (board: PlaitBoard) => {
    let pointIndex = 0;
    const options: WithResizeOptions<PlaitLine, LineResizeHandle> = {
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
                        pointIndex = handleRef.index;
                    }
                });
                return result;
            }
            return null;
        },
        onResize: (resizeRef: ResizeRef<PlaitLine, LineResizeHandle>, resizeState: ResizeState) => {
            let points: Point[] = [...resizeRef.element.points];
            let source: LineHandle = { ...resizeRef.element.source };
            let target: LineHandle = { ...resizeRef.element.target };
            if (resizeRef.handle === LineResizeHandle.source) {
                points[pointIndex] = resizeState.endTransformPoint;
                const hitElement = getHitOutlineGeometry(board, resizeState.endTransformPoint, -4);
                source.connection = hitElement ? transformPointToConnection(board, resizeState.endTransformPoint, hitElement) : undefined;
                source.boundId = hitElement ? hitElement.id : undefined;
            } else if (resizeRef.handle === LineResizeHandle.target) {
                points[pointIndex] = resizeState.endTransformPoint;
                const hitElement = getHitOutlineGeometry(board, resizeState.endTransformPoint, -4);
                target.connection = hitElement ? transformPointToConnection(board, resizeState.endTransformPoint, hitElement) : undefined;
                target.boundId = hitElement ? hitElement.id : undefined;
            } else if (resizeRef.handle === LineResizeHandle.addHandle) {
                points.splice(pointIndex + 1, 0, resizeState.endTransformPoint);
            } else {
                points[pointIndex] = resizeState.endTransformPoint;
            }
            DrawTransforms.resizeLine(board, { points, source, target }, resizeRef.path);
        }
    };

    withResize<PlaitLine, LineResizeHandle>(board, options);

    return board;
};
