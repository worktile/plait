import { PlaitBoard, Point, isHorizontalSegment, isVerticalSegment } from '@plait/core';
import { ResizeRef, ResizeState, WithResizeOptions, removeDuplicatePoints, withResize } from '@plait/common';
import { getSelectedLineElements } from '../utils/selected';
import { getHitLineResizeHandleRef, LineResizeHandle } from '../utils/position/line';
import { getHitOutlineGeometry } from '../utils/position/geometry';
import { LineHandle, LineShape, PlaitLine } from '../interfaces';
import { alignPoints, getLinePoints, getConnectionByNearestPoint, getElbowPoints, getNextSourceAndTargetPoints } from '../utils';
import { DrawTransforms } from '../transforms';
import { REACTION_MARGIN } from '../constants';

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
                            handle: handleRef.handle,
                            handleIndex: handleRef.index
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
            let handleIndex = resizeRef.handleIndex!;
            const hitElement = getHitOutlineGeometry(board, resizeState.endTransformPoint, REACTION_MARGIN);
            if (resizeRef.handle === LineResizeHandle.source || resizeRef.handle === LineResizeHandle.target) {
                const object = resizeRef.handle === LineResizeHandle.source ? source : target;
                points[handleIndex] = resizeState.endTransformPoint;
                if (hitElement) {
                    object.connection = getConnectionByNearestPoint(board, resizeState.endTransformPoint, hitElement);
                    object.boundId = hitElement.id;
                } else {
                    object.connection = undefined;
                    object.boundId = undefined;
                }
            } else if (resizeRef.handle === LineResizeHandle.addHandle) {
                if (resizeRef.element.shape === LineShape.elbow) {
                    let keyPoints = getElbowPoints(board, resizeRef.element);
                    const [nextSourcePoint, nextTargetPoint] = getNextSourceAndTargetPoints(board, resizeRef.element);
                    keyPoints.splice(0, 1, nextSourcePoint);
                    keyPoints.splice(-1, 1, nextTargetPoint);
                    keyPoints = removeDuplicatePoints(keyPoints);

                    let startPoint = keyPoints[handleIndex];
                    let endPoint = keyPoints[handleIndex + 1];
                    if (isHorizontalSegment([startPoint, endPoint])) {
                        startPoint = [startPoint[0], startPoint[1] + resizeState.offsetY];
                        endPoint = [endPoint[0], endPoint[1] + resizeState.offsetY];
                    }
                    if (isVerticalSegment([startPoint, endPoint])) {
                        startPoint = [startPoint[0] + resizeState.offsetX, startPoint[1]];
                        endPoint = [endPoint[0] + resizeState.offsetX, endPoint[1]];
                    }

                    const startIndex = points.findIndex(item => Point.isEquals(item, keyPoints[handleIndex]));
                    const endIndex = points.findIndex(item => Point.isEquals(item, keyPoints[handleIndex + 1]));
                    if (startIndex >= 0 && endIndex >= 0) {
                        points.splice(startIndex, 2, startPoint, endPoint);
                    }
                    if (startIndex >= 0 && endIndex < 0) {
                        points.splice(startIndex, 1, startPoint, endPoint);
                    }
                    if (endIndex >= 0 && startIndex < 0) {
                        points.splice(endIndex, 1, startPoint, endPoint);
                    }
                    if (endIndex < 0 && startIndex < 0) {
                        if (handleIndex < points.length / 2) {
                            points.splice(1, 0, startPoint, endPoint);
                        } else {
                            points.splice(-1, 0, startPoint, endPoint);
                        }
                    }
                } else {
                    points.splice(handleIndex + 1, 0, resizeState.endTransformPoint);
                }
            } else {
                points[handleIndex] = resizeState.endTransformPoint;
            }
            if (!hitElement) {
                handleIndex = resizeRef.handle === LineResizeHandle.addHandle ? handleIndex + 1 : handleIndex;
                const drawPoints = getLinePoints(board, resizeRef.element);
                const newPoints = [...points];
                newPoints[0] = drawPoints[0];
                newPoints[newPoints.length - 1] = drawPoints[drawPoints.length - 1];
                newPoints.forEach((point, index) => {
                    if (index === handleIndex) return;
                    points[handleIndex] = alignPoints(point, points[handleIndex]);
                });
            }
            DrawTransforms.resizeLine(board, { points, source, target }, resizeRef.path);
        }
    };

    withResize<PlaitLine, LineResizeHandle>(board, options);

    return board;
};
