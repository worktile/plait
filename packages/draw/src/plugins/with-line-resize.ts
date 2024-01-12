import { PlaitBoard, Point, isHorizontalSegment, isPointsOnSameLine, isVerticalSegment } from '@plait/core';
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
                    const drawPoints: Point[] = [...points].slice(1, points.length - 1);
                    let startIndex = drawPoints.findIndex(item => Point.isEquals(item, keyPoints[handleIndex]));
                    if (startIndex > -1) {
                        drawPoints.splice(startIndex, 1, startPoint);
                    } else {
                        for (let index = handleIndex - 1; index >= 0; index--) {
                            const previousIndex = drawPoints.findIndex(item => Point.isEquals(item, keyPoints[index]));
                            if (previousIndex > -1) {
                                startIndex = previousIndex;
                                break;
                            }
                        }
                        if (startIndex > -1) {
                            startIndex = startIndex + 1;
                        } else {
                            startIndex = 0;
                        }
                        drawPoints.splice(startIndex, 0, startPoint);
                        const endIndex = drawPoints.findIndex(item => Point.isEquals(item, keyPoints[handleIndex + 1]));
                        if (endIndex) {
                            drawPoints.splice(endIndex, 1, endPoint);
                        } else {
                            drawPoints.splice(startIndex + 1, 0, endPoint);
                        }
                    }
                    points = [points[0], ...drawPoints, points[points.length - 1]];
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
                    if (points[handleIndex]) {
                        points[handleIndex] = alignPoints(point, points[handleIndex]);
                    }
                });
            }
            DrawTransforms.resizeLine(board, { points, source, target }, resizeRef.path);
        }
    };

    withResize<PlaitLine, LineResizeHandle>(board, options);

    return board;
};
