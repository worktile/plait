import { createDebugGenerator, Path, PlaitBoard, PlaitNode, Point } from '@plait/core';
import { ResizeRef, ResizeState, WithResizeOptions, simplifyOrthogonalPoints, withResize } from '@plait/common';
import { getSelectedArrowLineElements } from '../../utils/selected';
import { getHitLineResizeHandleRef, LineResizeHandle } from '../../utils/position/line';
import { ArrowLineHandle, ArrowLineShape, PlaitArrowLine } from '../../interfaces';
import { DrawTransforms } from '../../transforms';
import { getElbowPoints, getNextRenderPoints, isUseDefaultOrthogonalRoute } from '../../utils/arrow-line/elbow';
import {
    alignElbowSegment,
    alignPoints,
    getIndexAndDeleteCountByKeyPoint,
    getResizedPreviousAndNextPoint,
    hasIllegalElbowPoint
} from '../../utils/arrow-line/arrow-line-resize';
import { getHitConnection, getArrowLinePoints } from '../../utils/arrow-line/arrow-line-basic';
import { getElbowLineRouteOptions } from '../../utils/arrow-line';
import { getSnappingShape } from '../../utils';

const debugGenerator = createDebugGenerator('debug:plait:arrow-line-resize');

export const withArrowLineResize = (board: PlaitBoard) => {
    let elbowLineIndex: number | null;
    let elbowLineDeleteCount: number | null;
    let elbowSourcePoint: Point | null;
    let elbowTargetPoint: Point | null;
    let elbowNextRenderPoints: Point[] | null;

    const options: WithResizeOptions<PlaitArrowLine, LineResizeHandle> = {
        key: 'draw-line',
        canResize: () => {
            return true;
        },
        hitTest: (point: Point) => {
            const selectedLineElements = getSelectedArrowLineElements(board);
            if (selectedLineElements.length > 0) {
                let result = null;
                selectedLineElements.forEach((value) => {
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
        beforeResize: (resizeRef: ResizeRef<PlaitArrowLine, LineResizeHandle>) => {
            if (
                resizeRef.element.shape === ArrowLineShape.elbow &&
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
        onResize: (resizeRef: ResizeRef<PlaitArrowLine, LineResizeHandle>, resizeState: ResizeState) => {
            const drawPoints = getArrowLinePoints(board, resizeRef.element);
            let points: Point[] = [...resizeRef.element.points];
            points[0] = drawPoints[0];
            points[points.length - 1] = drawPoints[drawPoints.length - 1];
            let source: ArrowLineHandle = { ...resizeRef.element.source };
            let target: ArrowLineHandle = { ...resizeRef.element.target };
            let handleIndex = resizeRef.handleIndex!;
            const hitElement = getSnappingShape(board, resizeState.endPoint);
            if (resizeRef.handle === LineResizeHandle.source || resizeRef.handle === LineResizeHandle.target) {
                const handleObject = resizeRef.handle === LineResizeHandle.source ? source : target;
                if (debugGenerator.isDebug()) {
                    debugGenerator.clear();
                    debugGenerator.drawCircles(board, points, 3, false);
                    debugGenerator.drawCircles(board, [resizeState.endPoint], 4, false, { fill: 'yellow' });
                }
                points[handleIndex] = resizeState.endPoint;
                points[handleIndex] = alignPoints(points, points[handleIndex], handleIndex);
                if (debugGenerator.isDebug()) {
                    debugGenerator.drawCircles(board, [points[handleIndex]], 2, false, { fill: 'green' });
                }
                if (hitElement) {
                    handleObject.connection = getHitConnection(board, points[handleIndex], hitElement);
                    handleObject.boundId = hitElement.id;
                } else {
                    handleObject.connection = undefined;
                    handleObject.boundId = undefined;
                }
            } else {
                if (resizeRef.element.shape === ArrowLineShape.elbow) {
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
                if (
                    resizeRef.element.shape !== ArrowLineShape.elbow ||
                    (resizeRef.element.shape === ArrowLineShape.elbow && points.length === 2)
                ) {
                    points[handleIndex] = alignPoints(points, points[handleIndex], handleIndex);
                }
            }
            DrawTransforms.resizeArrowLine(board, { points, source, target }, resizeRef.path as Path);
        },
        afterResize: (resizeRef: ResizeRef<PlaitArrowLine, LineResizeHandle>) => {
            if (resizeRef.element.shape === ArrowLineShape.elbow) {
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
                    DrawTransforms.resizeArrowLine(board, { points }, resizeRef.path as Path);
                }
            }
            elbowLineIndex = null;
            elbowLineDeleteCount = null;
            elbowSourcePoint = null;
            elbowTargetPoint = null;
            elbowNextRenderPoints = null;
        }
    };

    withResize<PlaitArrowLine, LineResizeHandle>(board, options);

    return board;
};
