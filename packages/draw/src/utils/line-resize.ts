import { ResizeState } from '@plait/common';
import { Point, isHorizontalSegment, isPointsOnSameLine } from '@plait/core';
import { LINE_ALIGN_TOLERANCE } from '../constants/line';

export const alignPoints = (basePoint: Point, movingPoint: Point) => {
    const newPoint: Point = [...movingPoint];
    if (Point.isVerticalAlign(newPoint, basePoint, LINE_ALIGN_TOLERANCE)) {
        newPoint[0] = basePoint[0];
    }
    if (Point.isHorizontalAlign(newPoint, basePoint, LINE_ALIGN_TOLERANCE)) {
        newPoint[1] = basePoint[1];
    }
    return newPoint;
};

export function getResizeReferencePoints(keyPoints: Point[], sourcePoint: Point, targetPoint: Point, handleIndex: number) {
    const referencePoint: { previous: Point | null; next: Point | null } = {
        previous: null,
        next: null
    };

    const startPoint = keyPoints[handleIndex];
    const endPoint = keyPoints[handleIndex + 1];
    const isHorizontal = Point.isHorizontalAlign(startPoint, endPoint);
    const isVertical = Point.isVerticalAlign(startPoint, endPoint);
    const previousPoint = keyPoints[handleIndex - 1] ?? keyPoints[0];
    const beforePreviousPoint = keyPoints[handleIndex - 2] ?? sourcePoint;
    if (
        (isHorizontal && Point.isHorizontalAlign(beforePreviousPoint, previousPoint)) ||
        (isVertical && Point.isVerticalAlign(beforePreviousPoint, previousPoint))
    ) {
        referencePoint.previous = previousPoint;
    }

    const nextPoint = keyPoints[handleIndex + 2] ?? keyPoints[keyPoints.length - 1];
    const afterNextPoint = keyPoints[handleIndex + 3] ?? targetPoint;
    if (
        (isHorizontal && Point.isHorizontalAlign(nextPoint, afterNextPoint)) ||
        (isVertical && Point.isVerticalAlign(nextPoint, afterNextPoint))
    ) {
        referencePoint.next = nextPoint;
    }
    return referencePoint;
}

export function alignElbowSegment(
    keyPoints1: Point,
    keyPoints2: Point,
    resizeState: ResizeState,
    referencePoints: { previous: Point | null; next: Point | null }
) {
    let newStartPoint = keyPoints1;
    let newEndPoint = keyPoints2;
    if (Point.isHorizontalAlign(keyPoints1, keyPoints2)) {
        const offsetY = Point.getOffsetY(resizeState.startPoint, resizeState.endPoint);
        let pointY = keyPoints1[1] + offsetY;
        if (referencePoints.previous && Math.abs(referencePoints.previous[1] - pointY) < LINE_ALIGN_TOLERANCE) {
            pointY = referencePoints.previous[1];
        } else if (referencePoints.next && Math.abs(referencePoints.next[1] - pointY) < LINE_ALIGN_TOLERANCE) {
            pointY = referencePoints.next[1];
        }
        newStartPoint = [keyPoints1[0], pointY];
        newEndPoint = [keyPoints2[0], pointY];
    }
    if (Point.isVerticalAlign(keyPoints1, keyPoints2)) {
        const offsetX = Point.getOffsetX(resizeState.startPoint, resizeState.endPoint);
        let pointX = keyPoints1[0] + offsetX;
        if (referencePoints.previous && Math.abs(referencePoints.previous[0] - pointX) < LINE_ALIGN_TOLERANCE) {
            pointX = referencePoints.previous[0];
        } else if (referencePoints.next && Math.abs(referencePoints.next[0] - pointX) < LINE_ALIGN_TOLERANCE) {
            pointX = referencePoints.next[0];
        }
        newStartPoint = [pointX, keyPoints1[1]];
        newEndPoint = [pointX, keyPoints2[1]];
    }
    return [newStartPoint, newEndPoint];
}

export function getIndexAndDeleteCountByKeyPoint(keyPoints1: Point[], keyPoints2: Point[], handleIndex: number) {
    let index: number | null = null;
    let deleteCount = 0;

    const startKeyPoint = keyPoints2[handleIndex];
    const endKeyPoint = keyPoints2[handleIndex + 1];
    const startIndex = keyPoints1.findIndex(item => Point.isEquals(item, startKeyPoint));
    const endIndex = keyPoints1.findIndex(item => Point.isEquals(item, endKeyPoint));

    if (Math.max(startIndex, endIndex) > -1) {
        if (startIndex > -1 && endIndex > -1) {
            return {
                index: startIndex,
                deleteCount: 2
            };
        }
        if (startIndex > -1 && endIndex === -1) {
            const isReplace =
                startIndex < keyPoints1.length - 1 &&
                isPointsOnSameLine([keyPoints1[startIndex], keyPoints1[startIndex + 1], startKeyPoint, endKeyPoint]);
            if (isReplace) {
                return {
                    index: startIndex,
                    deleteCount: 2
                };
            }
            return {
                index: startIndex,
                deleteCount: 1
            };
        }
        if (startIndex === -1 && endIndex > -1) {
            const isReplace =
                endIndex > 0 && isPointsOnSameLine([keyPoints1[endIndex], keyPoints1[endIndex - 1], startKeyPoint, endKeyPoint]);
            if (isReplace) {
                return {
                    index: endIndex - 1,
                    deleteCount: 2
                };
            }
            return {
                index: endIndex,
                deleteCount: 1
            };
        }
    } else {
        for (let i = 0; i < keyPoints1.length - 1; i++) {
            const currentPoint = keyPoints1[i];
            const nextPoint = keyPoints1[i + 1];
            if (isPointsOnSameLine([currentPoint, nextPoint, startKeyPoint, endKeyPoint])) {
                index = i;
                deleteCount = 2;
                break;
            }
            if (
                isPointsOnSameLine([currentPoint, nextPoint, startKeyPoint]) &&
                Point.isEquals(endKeyPoint, keyPoints2[keyPoints2.length - 1])
            ) {
                index = -1;
                deleteCount = 1;
                break;
            }
            if (isPointsOnSameLine([currentPoint, nextPoint, endKeyPoint]) && Point.isEquals(startKeyPoint, keyPoints2[0])) {
                index = 0;
                deleteCount = 1;
                break;
            }
        }
    }
    if (index === null) {
        deleteCount = 0;
        for (let i = handleIndex - 1; i >= 0; i--) {
            const previousIndex = keyPoints1.findIndex(item => Point.isEquals(item, keyPoints2[i]));
            if (previousIndex > -1) {
                index = previousIndex;
                break;
            }
        }
        index = index === null ? 0 : index + 1;
    }

    return {
        index,
        deleteCount
    };
}

export function removeIsolatedPoints(points: Point[]) {
    let dataPoint = [];
    if (points.length > 1) {
        for (let i = 0; i <= points.length - 1; i++) {
            const currentPoint = points[i];
            const nextPoint = points[i + 1];
            if (nextPoint && isPointsOnSameLine([currentPoint, nextPoint])) {
                dataPoint.push(currentPoint, nextPoint);
                i++;
                continue;
            } else {
                const previousPoint = points[i - 1];
                if (previousPoint && isPointsOnSameLine([currentPoint, previousPoint])) {
                    dataPoint.push(currentPoint);
                    continue;
                }
            }
        }
    }
    return dataPoint;
}
