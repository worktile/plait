import { PlaitBoard, Point } from '@plait/core';
import { ResizeRef, ResizeState, WithResizeOptions, withResize } from '@plait/common';
import { getSelectedLineElements } from '../utils/selected';
import { getHitLineResizeHandleRef, LineResizeHandle } from '../utils/position/line';
import { getHitOutlineGeometry } from '../utils/position/geometry';
import { LineHandle, PlaitLine } from '../interfaces';
import { alignPoints, getLinePoints, transformPointToConnection } from '../utils';
import { DrawTransforms } from '../transforms';
import { REACTION_MARGIN } from '../constants';

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
            if (resizeRef.handle === LineResizeHandle.source || resizeRef.handle === LineResizeHandle.target) {
                const object = resizeRef.handle === LineResizeHandle.source ? source : target;
                points[pointIndex] = resizeState.endTransformPoint;
                const hitElement = getHitOutlineGeometry(board, resizeState.endTransformPoint, REACTION_MARGIN);
                if (hitElement) {
                    object.connection = transformPointToConnection(board, resizeState.endTransformPoint, hitElement);
                    object.boundId = hitElement.id;
                } else {
                    object.connection = undefined;
                    object.boundId = undefined;
                    if (points.length === 2) {
                        let movingPoint = points[pointIndex];
                        const drawPoints = getLinePoints(board, resizeRef.element);
                        const index = pointIndex === 0 ? drawPoints.length - 1 : pointIndex;
                        const otherPoint = drawPoints[index];
                        points[pointIndex] = alignPoints(otherPoint, movingPoint);
                    }
                }
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
