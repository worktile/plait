import { PlaitBoard, Point } from '@plait/core';
import { ResizeRef, ResizeState, WithResizeOptions, withResize } from '@plait/common';
import { getSelectedLineElements } from '../utils/selected';
import { getHitLineResizeHandleRef, LineResizeHandle } from '../utils/position/line';
import { getHitOutlineGeometry } from '../utils/position/geometry';
import { LineHandle, LineShape, PlaitLine } from '../interfaces';
import {
    alignPoints,
    getLinePoints,
    getElbowPointsWithNextPoint,
    isPointsOnSameLine,
    isHorizontalSegment,
    isVerticalSegment,
    getConnectionByNearestPoint
} from '../utils';
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
                    object.connection = getConnectionByNearestPoint(board, resizeState.endTransformPoint, hitElement);
                    object.boundId = hitElement.id;
                } else {
                    object.connection = undefined;
                    object.boundId = undefined;
                }
            } else if (resizeRef.handle === LineResizeHandle.addHandle) {
                if (resizeRef.element.shape === LineShape.elbow) {
                    const keyPoints = getElbowPointsWithNextPoint(board, resizeRef.element);
                    let segmentStartIndex = pointIndex;
                    if (!isPointsOnSameLine(keyPoints.slice(0, 3))) {
                        segmentStartIndex = pointIndex - 1;
                    }
                    const drawPoints: Point[] = [];
                    keyPoints.forEach((item, index) => {
                        if (index !== segmentStartIndex && index !== segmentStartIndex + 1) {
                            drawPoints.push(item);
                        } else if (index === segmentStartIndex) {
                            let startPoint = keyPoints[index];
                            let endPoint = keyPoints[index + 1];
                            if (isHorizontalSegment(startPoint, endPoint)) {
                                startPoint = [startPoint[0], startPoint[1] + resizeState.offsetY];
                                endPoint = [endPoint[0], endPoint[1] + resizeState.offsetY];
                            }
                            if (isVerticalSegment(startPoint, endPoint)) {
                                startPoint = [startPoint[0] + resizeState.offsetX, startPoint[1]];
                                endPoint = [endPoint[0] + resizeState.offsetX, endPoint[1]];
                            }
                            if (segmentStartIndex === 1) {
                                drawPoints.push(item);
                            }
                            drawPoints.push(startPoint);
                            drawPoints.push(endPoint);
                            if (segmentStartIndex === keyPoints.length - 3) {
                                drawPoints.push(keyPoints[keyPoints.length - 2]);
                            }
                        }
                    });
                    drawPoints.splice(1, 1);
                    drawPoints.splice(-2, 1);
                    points = drawPoints;
                } else {
                    points.splice(pointIndex, 0, resizeState.endTransformPoint);
                }
            } else {
                points[pointIndex] = resizeState.endTransformPoint;
            }
            if (!hitElement) {
                const drawPoints = getLinePoints(board, resizeRef.element);
                const newPoints = [...points];
                newPoints[0] = drawPoints[0];
                newPoints[newPoints.length - 1] = drawPoints[drawPoints.length - 1];
                newPoints.forEach((point, index) => {
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
