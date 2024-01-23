import { ResizeState } from '@plait/common';
import { Point, getSegmentDirection, isPointsOnSameLine } from '@plait/core';

export function getResizeReferencePoints(
    keyPoints: Point[],
    sourcePoint: Point,
    targetPoint: Point,
    handleIndex: number,
    direction: 'x' | 'y' | ''
) {
    const referencePoint: { previous: Point | null; next: Point | null } = {
        previous: null,
        next: null
    };
    const previousPoint = keyPoints[handleIndex - 1] ?? keyPoints[0];
    const beforePreviousPoint = keyPoints[handleIndex - 2] ?? sourcePoint;
    if (direction === getSegmentDirection([beforePreviousPoint, previousPoint])) {
        referencePoint.previous = previousPoint;
    }

    const nextPoint = keyPoints[handleIndex + 2] ?? keyPoints[keyPoints.length - 1];
    const afterNextPoint = keyPoints[handleIndex + 3] ?? targetPoint;
    if (direction === getSegmentDirection([nextPoint, afterNextPoint])) {
        referencePoint.next = nextPoint;
    }
    return referencePoint;
}

export function getNewResizePoints(
    keyPoints1: Point,
    keyPoints2: Point,
    resizeState: ResizeState,
    referencePoints: { previous: Point | null; next: Point | null },
    direction: 'x' | 'y' | '',
    buffer = 4
) {
    let newStartPoint = keyPoints1;
    let newEndPoint = keyPoints2;
    if (direction === 'x') {
        const offsetY = Point.getOffsetY(resizeState.startPoint, resizeState.endPoint);
        let pointY = keyPoints1[1] + offsetY;
        if (referencePoints.previous && Math.abs(referencePoints.previous[1] - pointY) < buffer) {
            pointY = referencePoints.previous[1];
        } else if (referencePoints.next && Math.abs(referencePoints.next[1] - pointY) < buffer) {
            pointY = referencePoints.next[1];
        }
        newStartPoint = [keyPoints1[0], pointY];
        newEndPoint = [keyPoints2[0], pointY];
    }
    if (direction === 'y') {
        const offsetX = Point.getOffsetX(resizeState.startPoint, resizeState.endPoint);
        let pointX = keyPoints1[0] + offsetX;
        if (referencePoints.previous && Math.abs(referencePoints.previous[0] - pointX) < buffer) {
            pointX = referencePoints.previous[0];
        } else if (referencePoints.next && Math.abs(referencePoints.next[0] - pointX) < buffer) {
            pointX = referencePoints.next[0];
        }
        newStartPoint = [pointX, keyPoints1[1]];
        newEndPoint = [pointX, keyPoints2[1]];
    }
    return [newStartPoint, newEndPoint];
}

export function getIndexAndDeleteCountByKeyPoint(
    keyPoints1: Point[],
    keyPoints2: Point[],
    startKeyPoint: Point,
    endKeyPoint: Point,
    handleIndex: number
) {
    let index: number | null = null;
    let deleteCount = 0;
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
