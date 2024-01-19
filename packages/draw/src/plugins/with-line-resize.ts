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
            const hitElement = getHitOutlineGeometry(board, resizeState.endPoint, REACTION_MARGIN);
            if (resizeRef.handle === LineResizeHandle.source || resizeRef.handle === LineResizeHandle.target) {
                const object = resizeRef.handle === LineResizeHandle.source ? source : target;
                points[handleIndex] = resizeState.endPoint;
                if (hitElement) {
                    object.connection = getConnectionByNearestPoint(board, resizeState.endPoint, hitElement);
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
                        startPoint = [startPoint[0], startPoint[1] + Point.getOffsetY(resizeState.startPoint, resizeState.endPoint)];
                        endPoint = [endPoint[0], endPoint[1] + Point.getOffsetY(resizeState.startPoint, resizeState.endPoint)];
                    }
                    if (isVerticalSegment([startPoint, endPoint])) {
                        startPoint = [startPoint[0] + Point.getOffsetX(resizeState.startPoint, resizeState.endPoint), startPoint[1]];
                        endPoint = [endPoint[0] + Point.getOffsetX(resizeState.startPoint, resizeState.endPoint), endPoint[1]];
                    }
                    const drawPoints: Point[] = [...points].slice(1, points.length - 1);
                    const startIndex = drawPoints.findIndex(item => Point.isEquals(item, keyPoints[handleIndex]));
                    const endIndex = drawPoints.findIndex(item => Point.isEquals(item, keyPoints[handleIndex + 1]));
                    if (startIndex > -1 && endIndex > -1) {
                        drawPoints.splice(startIndex, 2, startPoint, endPoint);
                    } else if (startIndex > -1 && endIndex === -1) {
                        drawPoints.splice(startIndex, 1, startPoint, endPoint);
                    } else if (startIndex === -1 && endIndex > -1) {
                        drawPoints.splice(endIndex, 1, startPoint, endPoint);
                    } else {
                        let startIndex = -1;
                        for (let index = handleIndex - 1; index >= 0; index--) {
                            const previousIndex = drawPoints.findIndex(item => Point.isEquals(item, keyPoints[index]));
                            if (previousIndex > -1) {
                                startIndex = previousIndex;
                                break;
                            }
                        }
                        if (startIndex > -1) {
                            drawPoints.splice(startIndex + 1, 0, startPoint, endPoint);
                        } else {
                            drawPoints.splice(0, 0, startPoint, endPoint);
                        }
                    }
                    points = [points[0], ...drawPoints, points[points.length - 1]];
                } else {
                    points.splice(handleIndex + 1, 0, resizeState.endPoint);
                }
            } else {
                points[handleIndex] = resizeState.endPoint;
            }
            if (!hitElement) {
                handleIndex = resizeRef.handle === LineResizeHandle.addHandle ? handleIndex + 1 : handleIndex;
                const drawPoints = getLinePoints(board, resizeRef.element);
                const newPoints = [...points];
                newPoints[0] = drawPoints[0];
                newPoints[newPoints.length - 1] = drawPoints[drawPoints.length - 1];
                if (resizeRef.element.shape !== LineShape.elbow) {
                    newPoints.forEach((point, index) => {
                        if (index === handleIndex) return;
                        if (points[handleIndex]) {
                            points[handleIndex] = alignPoints(point, points[handleIndex]);
                        }
                    });
                }
            }
            DrawTransforms.resizeLine(board, { points, source, target }, resizeRef.path);
        }
    };

    withResize<PlaitLine, LineResizeHandle>(board, options);

    return board;
};
