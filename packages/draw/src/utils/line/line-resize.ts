import { ElbowLineRouteOptions, PRIMARY_COLOR, RESIZE_HANDLE_DIAMETER, ResizeState, getRectangleByPoints } from '@plait/common';
import { PlaitBoard, Point, RectangleClient, drawCircle, isPointsOnSameLine } from '@plait/core';
import { LINE_ALIGN_TOLERANCE } from '../../constants/line';

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
            if (isPointsOnSameLine([currentPoint, nextPoint, startKeyPoint])) {
                index = Math.min(i + 1, keyPoints1.length - 1);
                deleteCount = 1;
                break;
            }
            if (isPointsOnSameLine([currentPoint, nextPoint, endKeyPoint])) {
                index = Math.max(i - 1, 0);
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

export function getMirrorDataPoints(board: PlaitBoard, nextDataPoints: Point[], nextKeyPoints: Point[], params: ElbowLineRouteOptions) {
    const adjustByParallelSegments = (startIndex: number, reverseParallels: boolean = false) => {
        const beforePoint = nextDataPoints[startIndex - 1];
        const startPoint = nextDataPoints[startIndex];
        const endPoint = nextDataPoints[startIndex + 1];
        const afterPoint = nextDataPoints[startIndex + 2];
        const beforeSegment = [beforePoint, startPoint];
        const afterSegment = [endPoint, afterPoint];
        const isStraightWithBefore = isPointsOnSameLine(beforeSegment);
        const isStraightWithAfter = isPointsOnSameLine(afterSegment);
        const isAdjustStart = !isStraightWithBefore;
        const isAdjustEnd = !isStraightWithAfter;
        if (isAdjustStart || isAdjustEnd) {
            const parallelSegment = [startPoint, endPoint] as [Point, Point];
            const parallelSegments = findOrthogonalParallelSegments(parallelSegment, nextKeyPoints);
            const mirrorSegment = findMirrorSegment(
                board,
                parallelSegment,
                reverseParallels ? parallelSegments.reverse() : parallelSegments,
                params.sourceRectangle,
                params.targetRectangle
            );
            if (mirrorSegment) {
                if (isAdjustStart) {
                    nextDataPoints.splice(startIndex, 1, mirrorSegment[0]);
                }
                if (isAdjustEnd) {
                    nextDataPoints.splice(startIndex + 1, 1, mirrorSegment[1]);
                }
            } else {
                const isHorizontal = Point.isHorizontalAlign(startPoint, endPoint);
                const adjustIndex = isHorizontal ? 0 : 1;
                if (isAdjustStart) {
                    const newStartPoint = [startPoint[0], startPoint[1]] as Point;
                    newStartPoint[adjustIndex] = beforePoint[adjustIndex];
                    nextDataPoints.splice(startIndex, 1, newStartPoint);
                }
                if (isAdjustEnd) {
                    const newEndPoint = [endPoint[0], endPoint[1]] as Point;
                    newEndPoint[adjustIndex] = afterPoint[adjustIndex];
                    nextDataPoints.splice(startIndex + 1, 1, newEndPoint);
                }
            }
        }
    };
    // adjust first and second custom points
    adjustByParallelSegments(1);
    // adjust last and last second custom points
    if (nextDataPoints.length >= 5) {
        const startIndex = nextDataPoints.length - 3;
        adjustByParallelSegments(startIndex, true);
    }
    return nextDataPoints;
}

export function isResizeMiddleIndex(points: Point[], nextKeyPoints: Point[], middleIndex: number) {
    const { deleteCount } = getIndexAndDeleteCountByKeyPoint(points, nextKeyPoints, middleIndex);
    if (deleteCount > 1) {
        return true;
    }
    return false;
}

export function createUpdateHandle(board: PlaitBoard, point: Point) {
    return drawCircle(PlaitBoard.getRoughSVG(board), point, RESIZE_HANDLE_DIAMETER, {
        stroke: '#999999',
        strokeWidth: 1,
        fill: '#FFF',
        fillStyle: 'solid'
    });
}

export function createAddHandle(board: PlaitBoard, point: Point) {
    return drawCircle(PlaitBoard.getRoughSVG(board), point, RESIZE_HANDLE_DIAMETER, {
        stroke: '#FFFFFF80',
        strokeWidth: 1,
        fill: `${PRIMARY_COLOR}80`,
        fillStyle: 'solid'
    });
}

export function getMidKeyPoints(simplifiedNextKeyPoints: Point[], startPoint: Point, endPoint: Point) {
    let midElbowPoints: Point[] = [];
    let startPointIndex = -1;
    let endPointIndex = -1;
    for (let i = 0; i < simplifiedNextKeyPoints.length; i++) {
        if (isPointsOnSameLine([simplifiedNextKeyPoints[i], startPoint])) {
            startPointIndex = i;
        }
        if (startPointIndex > -1 && isPointsOnSameLine([simplifiedNextKeyPoints[i], endPoint])) {
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
    const isHorizontalSegment = Point.isHorizontalAlign(segment[0], segment[1]);
    const parallelSegments: [Point, Point][] = [];

    for (let i = 0; i < keyPoints.length - 1; i++) {
        const current = keyPoints[i];
        const next = keyPoints[i + 1];
        const isHorizontal = Point.isHorizontalAlign(current, next, 0.1);
        if (isHorizontalSegment && isHorizontal) {
            parallelSegments.push([current, next]);
        }
        if (!isHorizontalSegment && !isHorizontal) {
            parallelSegments.push([current, next]);
        }
    }

    return parallelSegments;
}

function findMirrorSegment(
    board: PlaitBoard,
    segment: [Point, Point],
    parallelSegments: [Point, Point][],
    sourceRectangle: RectangleClient,
    targetRectangle: RectangleClient
) {
    for (let index = 0; index < parallelSegments.length; index++) {
        const parallelPath = parallelSegments[index];
        const startPoint = [segment[0][0], segment[0][1]] as Point;
        const endPoint = [segment[1][0], segment[1][1]] as Point;
        const isHorizontal = Point.isHorizontalAlign(startPoint, endPoint);
        const adjustDataIndex = isHorizontal ? 0 : 1;
        startPoint[adjustDataIndex] = parallelPath[0][adjustDataIndex];
        endPoint[adjustDataIndex] = parallelPath[1][adjustDataIndex];
        const fakeRectangle = getRectangleByPoints([startPoint, endPoint, ...parallelPath]);
        const isValid = !RectangleClient.isHit(fakeRectangle, sourceRectangle) && !RectangleClient.isHit(fakeRectangle, targetRectangle);
        if (isValid) {
            // const fakeRectangleG = PlaitBoard.getRoughSVG(board).rectangle(
            //     fakeRectangle.x,
            //     fakeRectangle.y,
            //     fakeRectangle.width,
            //     fakeRectangle.height,
            //     { stroke: 'blue' }
            // );
            // PlaitBoard.getElementActiveHost(board).append(fakeRectangleG);
            return [startPoint, endPoint] as [Point, Point];
        }
    }
    return undefined;
}
