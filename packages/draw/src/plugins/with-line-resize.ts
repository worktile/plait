import { PlaitBoard, Point, getSegmentDirection, isHorizontalSegment, isVerticalSegment } from '@plait/core';
import { ResizeRef, ResizeState, WithResizeOptions, removeDuplicatePoints, withResize } from '@plait/common';
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
    getNewResizePoints,
    getLineHandleRefPair
} from '../utils';
import { DrawTransforms } from '../transforms';
import { REACTION_MARGIN } from '../constants';

export const withLineResize = (board: PlaitBoard) => {
    let elbowLineIndex: number;
    let elbowLineDeleteCount: number;
    let elbowLineKeyPoints: Point[];

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
                    const [nextSourcePoint, nextTargetPoint] = getNextSourceAndTargetPoints(board, resizeRef.element);
                    elbowLineKeyPoints.splice(0, 1, nextSourcePoint);
                    elbowLineKeyPoints.splice(-1, 1, nextTargetPoint);
                    elbowLineKeyPoints = removeDuplicatePoints(elbowLineKeyPoints);

                    const startPoint = elbowLineKeyPoints[handleIndex];
                    const endPoint = elbowLineKeyPoints[handleIndex + 1];
                    const drawPoints: Point[] = [...points].slice(1, points.length - 1);
                    const value = getIndexAndDeleteCountByKeyPoint(drawPoints, elbowLineKeyPoints, startPoint, endPoint, handleIndex);
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
                    const startPoint = elbowLineKeyPoints[handleIndex];
                    const endPoint = elbowLineKeyPoints[handleIndex + 1];
                    const direction = getSegmentDirection([startPoint, endPoint]);
                    const handleRefPair = getLineHandleRefPair(board, resizeRef.element);
                    const sourcePoint = handleRefPair.source.point;
                    const targetPoint = handleRefPair.target.point;
                    const referencePoints = getResizeReferencePoints(elbowLineKeyPoints, sourcePoint, targetPoint, handleIndex, direction);
                    const [newStartPoint, newEndPoint] = getNewResizePoints(
                        startPoint,
                        endPoint,
                        resizeState,
                        referencePoints,
                        direction,
                        4
                    );
                    const drawPoints: Point[] = [...points].slice(1, points.length - 1);
                    drawPoints.splice(elbowLineIndex, elbowLineDeleteCount, newStartPoint, newEndPoint);
                    points = [sourcePoint, ...drawPoints, targetPoint];
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
