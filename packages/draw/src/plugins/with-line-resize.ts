import { PlaitBoard, Point } from '@plait/core';
import { ResizeRef, ResizeState, WithResizeOptions, withResize } from '@plait/common';
import { getSelectedLineElements } from '../utils/selected';
import { getHitLineResizeHandleRef, LineResizeHandle } from '../utils/position/line';
import { getHitOutlineGeometry } from '../utils/position/geometry';
import { LineHandle, PlaitLine } from '../interfaces';
import { alignPoints, transformPointToConnection } from '../utils';
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
                        pointIndex = handleRef.handle === LineResizeHandle.addHandle ? handleRef.index + 1 : handleRef.index;
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
            const hitElement = getHitOutlineGeometry(board, resizeState.endTransformPoint, REACTION_MARGIN);
            if (resizeRef.handle === LineResizeHandle.source || resizeRef.handle === LineResizeHandle.target) {
                const object = resizeRef.handle === LineResizeHandle.source ? source : target;
                points[pointIndex] = resizeState.endTransformPoint;
                if (hitElement) {
                    object.connection = transformPointToConnection(board, resizeState.endTransformPoint, hitElement);
                    object.boundId = hitElement.id;
                } else {
                    object.connection = undefined;
                    object.boundId = undefined;
                }
            } else if (resizeRef.handle === LineResizeHandle.addHandle) {
                points.splice(pointIndex, 0, resizeState.endTransformPoint);
            } else {
                points[pointIndex] = resizeState.endTransformPoint;
            }
            if (!hitElement) {
                points.forEach((point, index) => {
                    if (index === pointIndex) return;
                    points[pointIndex] = alignPoints(point, points[pointIndex]);
                });
            }

            DrawTransforms.resizeLine(board, { points, source, target }, resizeRef.path);
        }
    };

    withResize<PlaitLine, LineResizeHandle>(board, options);

    return board;
};
