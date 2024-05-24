import { Path, PlaitBoard, PlaitNode, Point } from '@plait/core';
import { ResizeRef, ResizeState, WithResizeOptions, simplifyOrthogonalPoints, withResize } from '@plait/common';
import { getSelectedLineElements } from '../utils/selected';
import { getHitLineResizeHandleRef, LineResizeHandle } from '../utils/position/line';
import { LineHandle, LineShape, PlaitLine } from '../interfaces';
import { DrawTransforms } from '../transforms';
import { getElbowPoints, getNextRenderPoints, isUseDefaultOrthogonalRoute } from '../utils/line/elbow';
import {
    alignElbowSegment,
    alignPoints,
    getIndexAndDeleteCountByKeyPoint,
    getResizedPreviousAndNextPoint,
    hasIllegalElbowPoint
} from '../utils/line/line-resize';
import { getHitConnection, getLinePoints } from '../utils/line/line-basic';
import { getElbowLineRouteOptions } from '../utils/line';
import { getSnappingShape } from '../utils';

export const withLineResize = (board: PlaitBoard) => {
    let elbowLineIndex: number | null;
    let elbowLineDeleteCount: number | null;
    let elbowSourcePoint: Point | null;
    let elbowTargetPoint: Point | null;
    let elbowNextRenderPoints: Point[] | null;

    const options: WithResizeOptions<PlaitLine, LineResizeHandle> = {
        key: 'draw-line',
        canResize: () => {
            return true;
        },
        hitTest: (point: Point) => {
            const selectedLineElements = getSelectedLineElements(board);
            if (selectedLineElements.length > 0) {
                let result = null;
                selectedLineElements.forEach(value => {
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
        beforeResize: (resizeRef: ResizeRef<PlaitLine, LineResizeHandle>) => {
            if (
                resizeRef.element.shape === LineShape.elbow &&
                resizeRef.handle !== LineResizeHandle.source &&
                resizeRef.handle !== LineResizeHandle.target
            ) {
                const params = getElbowLineRouteOptions(board, resizeRef.element);
                if (isUseDefaultOrthogonalRoute(resizeRef.element, params)) {
                    return;
                }
                const points: Point[] = [...resizeRef.element.points];
                const handleIndex = resizeRef.handleIndex!;
                const pointsOnElbow = getElbowPoints(board, resizeRef.element);
                elbowSourcePoint = pointsOnElbow[0];
                elbowTargetPoint = pointsOnElbow[pointsOnElbow.length - 1];
                elbowNextRenderPoints = getNextRenderPoints(board, resizeRef.element, pointsOnElbow);

                const value = getIndexAndDeleteCountByKeyPoint(board, resizeRef.element, [...points], elbowNextRenderPoints, handleIndex);
                elbowLineIndex = value.index;
                elbowLineDeleteCount = value.deleteCount;
            }
        },
        onResize: (resizeRef: ResizeRef<PlaitLine, LineResizeHandle>, resizeState: ResizeState) => {
            let points: Point[] = [...resizeRef.element.points];
            let source: LineHandle = { ...resizeRef.element.source };
            let target: LineHandle = { ...resizeRef.element.target };
            let handleIndex = resizeRef.handleIndex!;
            const hitElement = getSnappingShape(board, resizeState.endPoint);
            if (resizeRef.handle === LineResizeHandle.source || resizeRef.handle === LineResizeHandle.target) {
                const object = resizeRef.handle === LineResizeHandle.source ? source : target;
                points[handleIndex] = resizeState.endPoint;
                if (hitElement) {
                    object.connection = getHitConnection(board, resizeState.endPoint, hitElement);
                    object.boundId = hitElement.id;
                } else {
                    object.connection = undefined;
                    object.boundId = undefined;
                }
            } else {
                if (resizeRef.element.shape === LineShape.elbow) {
                    if (elbowNextRenderPoints && elbowSourcePoint && elbowTargetPoint) {
                        const resizedPreviousAndNextPoint = getResizedPreviousAndNextPoint(
                            elbowNextRenderPoints,
                            elbowSourcePoint,
                            elbowTargetPoint,
                            handleIndex
                        );
                        const startKeyPoint = elbowNextRenderPoints[handleIndex];
                        const endKeyPoint = elbowNextRenderPoints[handleIndex + 1];
                        const [newStartPoint, newEndPoint] = alignElbowSegment(
                            startKeyPoint,
                            endKeyPoint,
                            resizeState,
                            resizedPreviousAndNextPoint
                        );
                        let midDataPoints: Point[] = [...points].slice(1, points.length - 1);
                        if (elbowLineIndex !== null && elbowLineDeleteCount !== null) {
                            if (hasIllegalElbowPoint(midDataPoints)) {
                                midDataPoints = [newStartPoint, newEndPoint];
                            } else {
                                midDataPoints.splice(elbowLineIndex, elbowLineDeleteCount, newStartPoint, newEndPoint);
                            }
                            points = [elbowSourcePoint, ...midDataPoints, elbowTargetPoint];
                        }
                    }
                } else {
                    if (resizeRef.handle === LineResizeHandle.addHandle) {
                        points.splice(handleIndex + 1, 0, resizeState.endPoint);
                    } else {
                        points[handleIndex] = resizeState.endPoint;
                    }
                }
            }

            if (!hitElement) {
                handleIndex = resizeRef.handle === LineResizeHandle.addHandle ? handleIndex + 1 : handleIndex;
                const drawPoints = getLinePoints(board, resizeRef.element);
                const newPoints = [...points];
                newPoints[0] = drawPoints[0];
                newPoints[newPoints.length - 1] = drawPoints[drawPoints.length - 1];
                if (
                    resizeRef.element.shape !== LineShape.elbow ||
                    (resizeRef.element.shape === LineShape.elbow && newPoints.length === 2)
                ) {
                    newPoints.forEach((point, index) => {
                        if (index === handleIndex) return;
                        if (points[handleIndex]) {
                            points[handleIndex] = alignPoints(point, points[handleIndex]);
                        }
                    });
                }
            }
            DrawTransforms.resizeLine(board, { points, source, target }, resizeRef.path as Path);
        },
        afterResize: (resizeRef: ResizeRef<PlaitLine, LineResizeHandle>) => {
            if (resizeRef.element.shape === LineShape.elbow) {
                const element = PlaitNode.get(board, resizeRef.path as Path);
                let points = element && [...element.points!];
                if (points.length > 2 && elbowNextRenderPoints && elbowSourcePoint && elbowTargetPoint) {
                    const nextSourcePoint = elbowNextRenderPoints[0];
                    const nextTargetPoint = elbowNextRenderPoints[elbowNextRenderPoints.length - 1];
                    points.splice(0, 1, nextSourcePoint);
                    points.splice(-1, 1, nextTargetPoint);
                    points = simplifyOrthogonalPoints(points!);
                    if (Point.isEquals(points[0], nextSourcePoint)) {
                        points.splice(0, 1);
                    }
                    if (Point.isEquals(points[points.length - 1], nextTargetPoint)) {
                        points.pop();
                    }
                    if (points.length === 1) {
                        points = [];
                    }
                    points = [elbowSourcePoint, ...points, elbowTargetPoint];
                    DrawTransforms.resizeLine(board, { points }, resizeRef.path as Path);
                }
            }
            elbowLineIndex = null;
            elbowLineDeleteCount = null;
            elbowSourcePoint = null;
            elbowTargetPoint = null;
            elbowNextRenderPoints = null;
        }
    };

    withResize<PlaitLine, LineResizeHandle>(board, options);

    return board;
};
