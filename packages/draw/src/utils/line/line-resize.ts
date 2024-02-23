import { ElbowLineRouteOptions, ResizeState, generateElbowLineRoute, removeDuplicatePoints, simplifyOrthogonalPoints } from '@plait/common';
import { PlaitBoard, Point, RectangleClient, drawCircle } from '@plait/core';
import { LINE_ALIGN_TOLERANCE } from '../../constants/line';
import { getElbowLineRouteOptions, getLineHandleRefPair } from './line-common';
import { PlaitLine } from '../../interfaces';

export const alignPoints = (basePoint: Point, movingPoint: Point) => {
    const newPoint: Point = [...movingPoint];
    if (Point.isVertical(newPoint, basePoint, LINE_ALIGN_TOLERANCE)) {
        newPoint[0] = basePoint[0];
    }
    if (Point.isHorizontal(newPoint, basePoint, LINE_ALIGN_TOLERANCE)) {
        newPoint[1] = basePoint[1];
    }
    return newPoint;
};

export function getResizedPreviousAndNextPoint(nextRenderPoints: Point[], sourcePoint: Point, targetPoint: Point, handleIndex: number) {
    const referencePoint: { previous: Point | null; next: Point | null } = {
        previous: null,
        next: null
    };

    const startPoint = nextRenderPoints[handleIndex];
    const endPoint = nextRenderPoints[handleIndex + 1];
    const isHorizontal = Point.isHorizontal(startPoint, endPoint);
    const isVertical = Point.isVertical(startPoint, endPoint);
    const previousPoint = nextRenderPoints[handleIndex - 1] ?? nextRenderPoints[0];
    const beforePreviousPoint = nextRenderPoints[handleIndex - 2] ?? sourcePoint;
    if (
        (isHorizontal && Point.isHorizontal(beforePreviousPoint, previousPoint)) ||
        (isVertical && Point.isVertical(beforePreviousPoint, previousPoint))
    ) {
        referencePoint.previous = previousPoint;
    }

    const nextPoint = nextRenderPoints[handleIndex + 2] ?? nextRenderPoints[nextRenderPoints.length - 1];
    const afterNextPoint = nextRenderPoints[handleIndex + 3] ?? targetPoint;
    if ((isHorizontal && Point.isHorizontal(nextPoint, afterNextPoint)) || (isVertical && Point.isVertical(nextPoint, afterNextPoint))) {
        referencePoint.next = nextPoint;
    }
    return referencePoint;
}

export function alignElbowSegment(
    startKeyPoint: Point,
    endKeyPoint: Point,
    resizeState: ResizeState,
    resizedPreviousAndNextPoint: { previous: Point | null; next: Point | null }
) {
    let newStartPoint = startKeyPoint;
    let newEndPoint = endKeyPoint;
    if (Point.isHorizontal(startKeyPoint, endKeyPoint)) {
        const offsetY = Point.getOffsetY(resizeState.startPoint, resizeState.endPoint);
        let pointY = startKeyPoint[1] + offsetY;
        if (resizedPreviousAndNextPoint.previous && Math.abs(resizedPreviousAndNextPoint.previous[1] - pointY) < LINE_ALIGN_TOLERANCE) {
            pointY = resizedPreviousAndNextPoint.previous[1];
        } else if (resizedPreviousAndNextPoint.next && Math.abs(resizedPreviousAndNextPoint.next[1] - pointY) < LINE_ALIGN_TOLERANCE) {
            pointY = resizedPreviousAndNextPoint.next[1];
        }
        newStartPoint = [startKeyPoint[0], pointY];
        newEndPoint = [endKeyPoint[0], pointY];
    }
    if (Point.isVertical(startKeyPoint, endKeyPoint)) {
        const offsetX = Point.getOffsetX(resizeState.startPoint, resizeState.endPoint);
        let pointX = startKeyPoint[0] + offsetX;
        if (resizedPreviousAndNextPoint.previous && Math.abs(resizedPreviousAndNextPoint.previous[0] - pointX) < LINE_ALIGN_TOLERANCE) {
            pointX = resizedPreviousAndNextPoint.previous[0];
        } else if (resizedPreviousAndNextPoint.next && Math.abs(resizedPreviousAndNextPoint.next[0] - pointX) < LINE_ALIGN_TOLERANCE) {
            pointX = resizedPreviousAndNextPoint.next[0];
        }
        newStartPoint = [pointX, startKeyPoint[1]];
        newEndPoint = [pointX, endKeyPoint[1]];
    }
    return [newStartPoint, newEndPoint];
}

export function getIndexAndDeleteCountByKeyPoint(
    board: PlaitBoard,
    element: PlaitLine,
    dataPoints: Point[],
    nextRenderPoints: Point[],
    handleIndex: number
) {
    let index: number | null = null;
    let deleteCount: number | null = null;

    const startKeyPoint = nextRenderPoints[handleIndex];
    const endKeyPoint = nextRenderPoints[handleIndex + 1];
    if (!startKeyPoint || !endKeyPoint) {
        return {
            index,
            deleteCount
        };
    }
    const midDataPoints = dataPoints.slice(1, -1);
    const startIndex = midDataPoints.findIndex(item => Point.isEquals(item, startKeyPoint));
    const endIndex = midDataPoints.findIndex(item => Point.isEquals(item, endKeyPoint));

    if (Math.max(startIndex, endIndex) > -1) {
        if (startIndex > -1 && endIndex > -1) {
            return {
                index: startIndex,
                deleteCount: 2
            };
        }
        if (startIndex > -1 && endIndex === -1) {
            const isReplace =
                startIndex < midDataPoints.length - 1 &&
                Point.isAlign([midDataPoints[startIndex], midDataPoints[startIndex + 1], startKeyPoint, endKeyPoint]);
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
                endIndex > 0 && Point.isAlign([midDataPoints[endIndex], midDataPoints[endIndex - 1], startKeyPoint, endKeyPoint]);
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
        for (let i = 0; i < midDataPoints.length - 1; i++) {
            const currentPoint = midDataPoints[i];
            const nextPoint = midDataPoints[i + 1];
            if (Point.isAlign([currentPoint, nextPoint, startKeyPoint, endKeyPoint])) {
                index = i;
                deleteCount = 2;
                break;
            }
            if (Point.isAlign([currentPoint, nextPoint, startKeyPoint])) {
                index = Math.min(i + 1, midDataPoints.length - 1);
                deleteCount = 1;
                break;
            }
            if (Point.isAlign([currentPoint, nextPoint, endKeyPoint])) {
                index = Math.max(i - 1, 0);
                deleteCount = 1;
                break;
            }
        }
    }
    if (index === null) {
        deleteCount = 0;
        if (midDataPoints.length > 0) {
            const handleRefPair = getLineHandleRefPair(board, element);
            const params = getElbowLineRouteOptions(board, element, handleRefPair);
            const keyPoints = simplifyOrthogonalPoints(removeDuplicatePoints(generateElbowLineRoute(params)));
            const simplifiedNextKeyPoints = keyPoints.slice(1, keyPoints.length - 1);
            const nextStartRenderPoint = nextRenderPoints[0];
            const nextEndRenderPoint = nextRenderPoints[nextRenderPoints.length - 1];
            if (!Point.isEquals(simplifiedNextKeyPoints[0], nextStartRenderPoint)) {
                simplifiedNextKeyPoints.unshift(nextStartRenderPoint);
            }
            if (!Point.isEquals(simplifiedNextKeyPoints[simplifiedNextKeyPoints.length - 1], nextEndRenderPoint)) {
                simplifiedNextKeyPoints.push(nextEndRenderPoint);
            }
            const nextDataPoints = [nextStartRenderPoint, ...midDataPoints, nextEndRenderPoint];
            const mirrorDataPoints = getMirrorDataPoints(board, nextDataPoints, simplifiedNextKeyPoints, params);
            for (let i = handleIndex - 1; i >= 0; i--) {
                const previousIndex = mirrorDataPoints.slice(1, -1).findIndex(item => Point.isEquals(item, nextRenderPoints[i]));
                if (previousIndex > -1) {
                    index = previousIndex + 1;
                    break;
                }
            }
            if (index === null) {
                index = 0;
                // When renderPoints is a straight line and dataPoints are not on the line,
                // the default 'deleteCount' is set to midDataPoints.length.
                if (Point.isAlign(nextRenderPoints)) {
                    deleteCount = midDataPoints.length;
                }
            }
        } else {
            index = 0;
        }
    }

    return {
        index,
        deleteCount
    };
}

export function getMirrorDataPoints(board: PlaitBoard, nextDataPoints: Point[], nextKeyPoints: Point[], params: ElbowLineRouteOptions) {
    for (let index = 1; index < nextDataPoints.length - 2; index++) {
        adjustByCustomPointStartIndex(board, index, nextDataPoints, nextKeyPoints, params);
    }
    return nextDataPoints;
}

/**
 * adjust based parallel segment
 */
const adjustByCustomPointStartIndex = (
    board: PlaitBoard,
    customPointStartIndex: number,
    nextDataPoints: Point[],
    nextKeyPoints: Point[],
    params: ElbowLineRouteOptions
) => {
    const beforePoint = nextDataPoints[customPointStartIndex - 1];
    const startPoint = nextDataPoints[customPointStartIndex];
    const endPoint = nextDataPoints[customPointStartIndex + 1];
    const afterPoint = nextDataPoints[customPointStartIndex + 2];
    const beforeSegment = [beforePoint, startPoint];
    const afterSegment = [endPoint, afterPoint];
    const isStraightWithBefore = Point.isAlign(beforeSegment);
    const isStraightWithAfter = Point.isAlign(afterSegment);
    let isAdjustStart = false;
    let isAdjustEnd = false;
    if (!isStraightWithBefore || !isStraightWithAfter) {
        const midKeyPointsWithBefore = getMidKeyPoints(nextKeyPoints, beforeSegment[0], beforeSegment[1]);
        const midKeyPointsWithAfter = getMidKeyPoints(nextKeyPoints, afterSegment[0], afterSegment[1]);
        const hasMidKeyPoints = midKeyPointsWithBefore.length > 0 && midKeyPointsWithAfter.length > 0;
        isAdjustStart = !isStraightWithBefore && !hasMidKeyPoints;
        isAdjustEnd = !isStraightWithAfter && !hasMidKeyPoints;
    }
    if (isAdjustStart || isAdjustEnd) {
        const parallelSegment = [startPoint, endPoint] as [Point, Point];
        const parallelSegments = findOrthogonalParallelSegments(parallelSegment, nextKeyPoints);
        const mirrorSegments = findMirrorSegments(board, parallelSegment, parallelSegments, params.sourceRectangle, params.targetRectangle);
        if (mirrorSegments.length === 1) {
            const mirrorSegment = mirrorSegments[0];
            if (isAdjustStart) {
                nextDataPoints.splice(customPointStartIndex, 1, mirrorSegment[0]);
            }
            if (isAdjustEnd) {
                nextDataPoints.splice(customPointStartIndex + 1, 1, mirrorSegment[1]);
            }
        } else {
            const isHorizontal = Point.isHorizontal(startPoint, endPoint);
            const adjustIndex = isHorizontal ? 0 : 1;
            if (isAdjustStart) {
                const newStartPoint = [startPoint[0], startPoint[1]] as Point;
                newStartPoint[adjustIndex] = beforePoint[adjustIndex];
                nextDataPoints.splice(customPointStartIndex, 1, newStartPoint);
            }
            if (isAdjustEnd) {
                const newEndPoint = [endPoint[0], endPoint[1]] as Point;
                newEndPoint[adjustIndex] = afterPoint[adjustIndex];
                nextDataPoints.splice(customPointStartIndex + 1, 1, newEndPoint);
            }
        }
    }
};

export function isUpdatedHandleIndex(
    board: PlaitBoard,
    element: PlaitLine,
    dataPoints: Point[],
    nextRenderPoints: Point[],
    handleIndex: number
) {
    const { deleteCount } = getIndexAndDeleteCountByKeyPoint(board, element, dataPoints, nextRenderPoints, handleIndex);
    if (deleteCount !== null && deleteCount > 1) {
        return true;
    }
    return false;
}

export function getMidKeyPoints(simplifiedNextKeyPoints: Point[], startPoint: Point, endPoint: Point) {
    let midElbowPoints: Point[] = [];
    let startPointIndex = -1;
    let endPointIndex = -1;
    for (let i = 0; i < simplifiedNextKeyPoints.length; i++) {
        if (Point.isAlign([simplifiedNextKeyPoints[i], startPoint])) {
            startPointIndex = i;
        }
        if (startPointIndex > -1 && Point.isAlign([simplifiedNextKeyPoints[i], endPoint])) {
            endPointIndex = i;
            break;
        }
    }
    if (startPointIndex > -1 && endPointIndex > -1) {
        midElbowPoints = simplifiedNextKeyPoints.slice(startPointIndex, endPointIndex + 1);
    }
    return midElbowPoints;
}

function findOrthogonalParallelSegments(segment: [Point, Point], keyPoints: Point[]): [Point, Point][] {
    const isHorizontalSegment = Point.isHorizontal(segment[0], segment[1]);
    const parallelSegments: [Point, Point][] = [];

    for (let i = 0; i < keyPoints.length - 1; i++) {
        const current = keyPoints[i];
        const next = keyPoints[i + 1];
        const isHorizontal = Point.isHorizontal(current, next, 0.1);
        if (isHorizontalSegment && isHorizontal) {
            parallelSegments.push([current, next]);
        }
        if (!isHorizontalSegment && !isHorizontal) {
            parallelSegments.push([current, next]);
        }
    }

    return parallelSegments;
}

function findMirrorSegments(
    board: PlaitBoard,
    segment: [Point, Point],
    parallelSegments: [Point, Point][],
    sourceRectangle: RectangleClient,
    targetRectangle: RectangleClient
) {
    const mirrorSegments: [Point, Point][] = [];
    for (let index = 0; index < parallelSegments.length; index++) {
        const parallelPath = parallelSegments[index];
        const startPoint = [segment[0][0], segment[0][1]] as Point;
        const endPoint = [segment[1][0], segment[1][1]] as Point;
        const isHorizontal = Point.isHorizontal(startPoint, endPoint);
        const adjustDataIndex = isHorizontal ? 0 : 1;
        startPoint[adjustDataIndex] = parallelPath[0][adjustDataIndex];
        endPoint[adjustDataIndex] = parallelPath[1][adjustDataIndex];
        const fakeRectangle = RectangleClient.getRectangleByPoints([startPoint, endPoint, ...parallelPath]);
        const isValid = !RectangleClient.isHit(fakeRectangle, sourceRectangle) && !RectangleClient.isHit(fakeRectangle, targetRectangle);
        if (isValid) {
            mirrorSegments.push([startPoint, endPoint]);
            // const fakeRectangleG = PlaitBoard.getRoughSVG(board).rectangle(
            //     fakeRectangle.x,
            //     fakeRectangle.y,
            //     fakeRectangle.width,
            //     fakeRectangle.height,
            //     { stroke: 'blue' }
            // );
            // PlaitBoard.getElementActiveHost(board).append(fakeRectangleG);
        }
    }
    return mirrorSegments;
}

export const hasIllegalElbowPoint = (midDataPoints: Point[]): boolean => {
    if (midDataPoints.length === 1) {
        return true;
    }
    return midDataPoints.some((item, index) => {
        const beforePoint = midDataPoints[index - 1];
        const afterPoint = midDataPoints[index + 1];
        const beforeSegment = beforePoint && [beforePoint, item];
        const afterSegment = afterPoint && [item, afterPoint];
        const isStraightWithBefore = beforeSegment && Point.isAlign(beforeSegment);
        const isStraightWithAfter = afterSegment && Point.isAlign(afterSegment);
        if (index === 0) {
            return !isStraightWithAfter;
        }
        if (index === midDataPoints.length - 1) {
            return !isStraightWithBefore;
        }
        return !isStraightWithBefore && !isStraightWithAfter;
    });
};
