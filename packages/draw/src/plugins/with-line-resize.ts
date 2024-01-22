import { PlaitBoard, Point, isHorizontalSegment, isVerticalSegment } from '@plait/core';
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
    getUpdateIndexAndDeleteCount
} from '../utils';
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

                    const startPoint = keyPoints[handleIndex];
                    const endPoint = keyPoints[handleIndex + 1];
                    let newStartPoint = startPoint;
                    let newEndPoint = endPoint;
                    if (isHorizontalSegment([startPoint, endPoint])) {
                        const offsetY = Point.getOffsetY(resizeState.startPoint, resizeState.endPoint);
                        newStartPoint = [startPoint[0], startPoint[1] + offsetY];
                        newEndPoint = [endPoint[0], endPoint[1] + offsetY];
                    }
                    if (isVerticalSegment([startPoint, endPoint])) {
                        const offsetX = Point.getOffsetX(resizeState.startPoint, resizeState.endPoint);
                        newStartPoint = [startPoint[0] + offsetX, startPoint[1]];
                        newEndPoint = [endPoint[0] + offsetX, endPoint[1]];
                    }
                    const drawPoints: Point[] = [...points].slice(1, points.length - 1);
                    const { index, deleteCount } = getUpdateIndexAndDeleteCount(drawPoints, keyPoints, startPoint, endPoint, handleIndex);
                    drawPoints.splice(index, deleteCount, newStartPoint, newEndPoint);
                    console.log(drawPoints);
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
