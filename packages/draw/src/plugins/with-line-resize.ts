import { PlaitBoard, PlaitNode, Point } from '@plait/core';
import { ResizeRef, ResizeState, WithResizeOptions, removeDuplicatePoints, simplifyOrthogonalPoints, withResize } from '@plait/common';
import { getSelectedLineElements } from '../utils/selected';
import { getHitLineResizeHandleRef, LineResizeHandle } from '../utils/position/line';
import { getHitOutlineGeometry } from '../utils/position/geometry';
import { LineHandle, LineShape, PlaitLine } from '../interfaces';
import {
    alignPoints,
    getLinePoints,
    getConnectionByNearestPoint,
    getElbowPoints,
    getNextSourceAndTargetPoints,
    getIndexAndDeleteCountByKeyPoint,
    getResizeReferencePoints,
    alignElbowSegment
} from '../utils';
import { DrawTransforms } from '../transforms';
import { REACTION_MARGIN } from '../constants';

export const withLineResize = (board: PlaitBoard) => {
    let elbowLineIndex: number | null;
    let elbowLineDeleteCount: number | null;
    let elbowSourcePoint: Point | null;
    let elbowTargetPoint: Point | null;
    let elbowLineKeyPoints: Point[] | null;

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
        beforeResize: (resizeRef: ResizeRef<PlaitLine, LineResizeHandle>) => {
            if (resizeRef.handle === LineResizeHandle.addHandle) {
                if (resizeRef.element.shape === LineShape.elbow) {
                    let points: Point[] = [...resizeRef.element.points];
                    let handleIndex = resizeRef.handleIndex!;
                    elbowLineKeyPoints = getElbowPoints(board, resizeRef.element);
                    elbowSourcePoint = elbowLineKeyPoints[0];
                    elbowTargetPoint = elbowLineKeyPoints[elbowLineKeyPoints.length - 1];
                    const [nextSourcePoint, nextTargetPoint] = getNextSourceAndTargetPoints(board, resizeRef.element);
                    elbowLineKeyPoints.splice(0, 1, nextSourcePoint);
                    elbowLineKeyPoints.splice(-1, 1, nextTargetPoint);
                    elbowLineKeyPoints = removeDuplicatePoints(elbowLineKeyPoints);

                    const drawPoints: Point[] = [...points].slice(1, points.length - 1);
                    const value = getIndexAndDeleteCountByKeyPoint(drawPoints, elbowLineKeyPoints, handleIndex);
                    elbowLineIndex = value.index;
                    elbowLineDeleteCount = value.deleteCount;
                }
            }
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
                    if (elbowLineKeyPoints && elbowSourcePoint && elbowTargetPoint) {
                        const referencePoints = getResizeReferencePoints(
                            elbowLineKeyPoints,
                            elbowSourcePoint,
                            elbowTargetPoint,
                            handleIndex
                        );
                        const startPoint = elbowLineKeyPoints[handleIndex];
                        const endPoint = elbowLineKeyPoints[handleIndex + 1];
                        const [newStartPoint, newEndPoint] = alignElbowSegment(startPoint, endPoint, resizeState, referencePoints);
                        const drawPoints: Point[] = [...points].slice(1, points.length - 1);
                        if (elbowLineIndex !== null && elbowLineDeleteCount !== null) {
                            drawPoints.splice(elbowLineIndex, elbowLineDeleteCount, newStartPoint, newEndPoint);
                            points = [elbowSourcePoint, ...drawPoints, elbowTargetPoint];
                        }
                    }
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
        },
        afterResize: (resizeRef: ResizeRef<PlaitLine, LineResizeHandle>) => {
            if (resizeRef.element.shape === LineShape.elbow) {
                const element = PlaitNode.get(board, resizeRef.path);
                let points = element && [...element.points!];
                if (points.length > 2 && elbowLineKeyPoints) {
                    points.splice(1, 0, elbowLineKeyPoints[0]);
                    points.splice(-1, 0, elbowLineKeyPoints[elbowLineKeyPoints.length - 1]);
                    points = simplifyOrthogonalPoints(points!);
                    if (Point.isEquals(points[1], elbowLineKeyPoints[0])) {
                        points.splice(1, 1);
                    }
                    if (Point.isEquals(points[points.length - 2], elbowLineKeyPoints[elbowLineKeyPoints.length - 1])) {
                        points.splice(-1, 1);
                    }
                    DrawTransforms.resizeLine(board, { points }, resizeRef.path);
                }
            }
            elbowLineIndex = null;
            elbowLineDeleteCount = null;
            elbowSourcePoint = null;
            elbowTargetPoint = null;
            elbowLineKeyPoints = null;
        }
    };

    withResize<PlaitLine, LineResizeHandle>(board, options);

    return board;
};
