import { isClosedVectorLine } from './../utils/vector-line';
import { Path, PlaitBoard, Point, Transforms, distanceBetweenPointAndPoint } from '@plait/core';
import { ResizeRef, ResizeState, WithResizeOptions, withResize } from '@plait/common';
import { getSelectedVectorLineElements } from '../utils/selected';
import { getHitLineResizeHandleRef, LineResizeHandle } from '../utils/position/line';
import { PlaitVectorLine } from '../interfaces';
import { LINE_HIT_GEOMETRY_BUFFER } from '../constants';

export const withVectorLineResize = (board: PlaitBoard) => {
    const options: WithResizeOptions<PlaitVectorLine, LineResizeHandle> = {
        key: 'draw-vector-line',
        canResize: () => {
            return true;
        },
        hitTest: (point: Point) => {
            const selectedVectorLineElements = getSelectedVectorLineElements(board);
            if (selectedVectorLineElements.length > 0) {
                let result = null;
                selectedVectorLineElements.forEach(value => {
                    const handleRef = getHitLineResizeHandleRef(board, value, point);
                    if (handleRef) {
                        result = {
                            element: value,
                            handle: handleRef.handle,
                            handleIndex: handleRef.handleIndex
                        };
                    }
                });
                return result;
            }
            return null;
        },

        onResize: (resizeRef: ResizeRef<PlaitVectorLine, LineResizeHandle>, resizeState: ResizeState) => {
            let points: Point[] = [...resizeRef.element.points];
            let handleIndex = resizeRef.handleIndex!;
            if (resizeRef.handle === LineResizeHandle.source || resizeRef.handle === LineResizeHandle.target) {
                points[handleIndex] = resizeState.endPoint;
                if (isClosedVectorLine(resizeRef.element)) {
                    points[points.length - 1] = resizeState.endPoint;
                } else {
                    const targetPoint = resizeRef.handle === LineResizeHandle.source ? points[points.length - 1] : points[0];
                    const distance = distanceBetweenPointAndPoint(...resizeState.endPoint, ...targetPoint);
                    if (distance <= LINE_HIT_GEOMETRY_BUFFER) {
                        points[handleIndex] = targetPoint;
                    }
                }
            } else {
                if (resizeRef.handle === LineResizeHandle.addHandle) {
                    points.splice(handleIndex + 1, 0, resizeState.endPoint);
                } else {
                    points[handleIndex] = resizeState.endPoint;
                }
            }

            Transforms.setNode(board, { points }, resizeRef.path as Path);
        }
    };

    withResize<PlaitVectorLine, LineResizeHandle>(board, options);

    return board;
};
