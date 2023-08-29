import { PlaitBoard, Point, RectangleClient, Transforms, getNearestPointBetweenPointAndSegments } from '@plait/core';
import { PlaitGeometry } from '../interfaces/geometry';
import { ResizeRef, ResizeState, WithResizeOptions, getRectangleByPoints, withResize } from '@plait/common';
import { getSelectedLineElements } from '../utils/selected';
import { getHitLineResizeHandleRef, LineResizeHandle } from '../utils/position/line';
import { getHitOutlineGeometry } from '../utils/position/geometry';
import { LineHandle, PlaitLine } from '../interfaces';
import { transformPointToConnection } from '../utils';
import { DrawTransforms } from '../transforms';

export const withLineResize = (board: PlaitBoard) => {
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
                points[0] = resizeState.endTransformPoint;
                const hitElement = getHitOutlineGeometry(board, resizeState.endTransformPoint, -4);

                source.connection = hitElement ? transformPointToConnection(resizeState.endTransformPoint, hitElement) : undefined;
                source.boundId = hitElement ? hitElement.id : undefined;
            }
            if (resizeRef.handle === LineResizeHandle.target) {
                points[1] = resizeState.endTransformPoint;
                const hitElement = getHitOutlineGeometry(board, resizeState.endTransformPoint, -4);
                target.connection = hitElement ? transformPointToConnection(resizeState.endTransformPoint, hitElement) : undefined;
                target.boundId = hitElement ? hitElement.id : undefined;
            }
            DrawTransforms.resizeLine(board, { points, source, target }, resizeRef.path);
        }
    };

    withResize<PlaitLine, LineResizeHandle>(board, options);

    return board;
};
