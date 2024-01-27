import { Point, PlaitBoard, getElementById, RectangleClient, Vector, isPointsOnSameLine } from '@plait/core';
import {
    getPoints,
    getRectangleByPoints,
    getPointByVector,
    removeDuplicatePoints,
    generateElbowLineRoute,
    getNextPoint,
    getSourceAndTargetOuterRectangle,
    simplifyOrthogonalPoints,
    isSourceAndTargetIntersect
} from '@plait/common';
import { BasicShapes, LineHandleRefPair, PlaitGeometry, PlaitLine } from '../../interfaces';
import { createGeometryElement } from '../geometry';
import { getStrokeWidthByElement } from '../style/stroke';
import { getLineHandleRefPair } from './line-common';

export const getElbowLineRouteOptions = (board: PlaitBoard, element: PlaitLine, handleRefPair?: LineHandleRefPair) => {
    handleRefPair = handleRefPair ?? getLineHandleRefPair(board, element);
    const { sourceRectangle, targetRectangle } = getSourceAndTargetRectangle(board, element, handleRefPair);
    const { sourceOuterRectangle, targetOuterRectangle } = getSourceAndTargetOuterRectangle(sourceRectangle, targetRectangle);
    const sourcePoint = handleRefPair.source.point;
    const targetPoint = handleRefPair.target.point;
    const nextSourcePoint = getNextPoint(sourcePoint, sourceOuterRectangle, handleRefPair.source.direction);
    const nextTargetPoint = getNextPoint(targetPoint, targetOuterRectangle, handleRefPair.target.direction);
    return {
        sourcePoint,
        nextSourcePoint,
        sourceRectangle,
        sourceOuterRectangle,
        targetPoint,
        nextTargetPoint,
        targetRectangle,
        targetOuterRectangle
    };
};

export const getElbowPoints = (board: PlaitBoard, element: PlaitLine) => {
    const handleRefPair = getLineHandleRefPair(board, element);
    const params = getElbowLineRouteOptions(board, element, handleRefPair);
    const isIntersect = isSourceAndTargetIntersect(params);
    if (isIntersect) {
        return getPoints(
            handleRefPair.source.point,
            handleRefPair.source.direction,
            handleRefPair.target.point,
            handleRefPair.target.direction,
            0
        );
    }
    const keyPoints = removeDuplicatePoints(generateElbowLineRoute(params));
    const nextKeyPoints = keyPoints.slice(1, keyPoints.length - 1);
    if (element.points.length === 2) {
        return simplifyOrthogonalPoints(keyPoints);
    } else {
        const simplifiedNextKeyPoints = simplifyOrthogonalPoints(nextKeyPoints);
        const dataPoints = removeDuplicatePoints(PlaitLine.getPoints(board, element));
        dataPoints.splice(0, 1, simplifiedNextKeyPoints[0]);
        dataPoints.splice(-1, 1, simplifiedNextKeyPoints[simplifiedNextKeyPoints.length - 1]);
        const renderPoints: Point[] = [keyPoints[0]];
        const adjustByParallelSegment = (startIndex: number, before: boolean = true) => {
            const beforePoint = dataPoints[startIndex - 1];
            const startPoint = dataPoints[startIndex];
            const endPoint = dataPoints[startIndex + 1];
            const afterPoint = dataPoints[startIndex + 2];
            const isStraightWithBefore = isPointsOnSameLine([beforePoint, startPoint]);
            const isStraightWithAfter = isPointsOnSameLine([endPoint, afterPoint]);
            if (!(isStraightWithBefore && isStraightWithAfter)) {
                const matchSegment = (before ? [beforePoint, startPoint] : [endPoint, afterPoint]) as [Point, Point];
                const midKeyPoints = getMidKeyPoints(simplifiedNextKeyPoints, matchSegment[0], matchSegment[1]);
                if (midKeyPoints.length === 0) {
                    const parallelSegment = [startPoint, endPoint] as [Point, Point];
                    const parallelSegments = findOrthogonalParallelSegments(parallelSegment, simplifiedNextKeyPoints);
                    const referenceSegment = findReferenceSegment(
                        board,
                        parallelSegment,
                        before ? parallelSegments : parallelSegments.reverse(),
                        params.sourceRectangle,
                        params.targetRectangle
                    );
                    if (referenceSegment) {
                        if (before) {
                            if (!isStraightWithAfter) {
                                dataPoints.splice(startIndex, 2, ...referenceSegment);
                            } else {
                                dataPoints.splice(startIndex, 1, referenceSegment[0]);
                            }
                        } else {
                            if (!isStraightWithBefore) {
                                dataPoints.splice(startIndex, 2, ...referenceSegment);
                            } else {
                                dataPoints.splice(startIndex + 1, 1, referenceSegment[1]);
                            }
                        }
                    } else {
                        const isHorizontal = Point.isHorizontalAlign(startPoint, endPoint);
                        const adjustIndex = isHorizontal ? 0 : 1;
                        if (before) {
                            const newStartPoint = [startPoint[0], startPoint[1]] as Point;
                            newStartPoint[adjustIndex] = beforePoint[adjustIndex];
                            dataPoints.splice(startIndex, 1, newStartPoint);
                        } else {
                            const newEndPoint = [endPoint[0], endPoint[1]] as Point;
                            newEndPoint[adjustIndex] = afterPoint[adjustIndex];
                            dataPoints.splice(startIndex + 1, 1, newEndPoint);
                        }
                    }
                }
            }
        };
        // adjust first and second custom points
        adjustByParallelSegment(1);
        adjustByParallelSegment(1, false);
        // adjust last and last second custom points
        if (dataPoints.length >= 5) {
            const startIndex = dataPoints.length - 3;
            adjustByParallelSegment(startIndex, false);
        }
        for (let index = 0; index < dataPoints.length - 1; index++) {
            let currentPoint = dataPoints[index];
            let nextPoint = dataPoints[index + 1];
            const isStraight = isPointsOnSameLine([currentPoint, nextPoint]);
            if (!isStraight) {
                const midKeyPoints = getMidKeyPoints(simplifiedNextKeyPoints, currentPoint, nextPoint);
                if (midKeyPoints.length) {
                    renderPoints.push(currentPoint);
                    renderPoints.push(...midKeyPoints);
                } else {
                    console.log('unknown data points');
                }
            } else {
                renderPoints.push(currentPoint);
            }
        }
        renderPoints.push(keyPoints[keyPoints.length - 2], keyPoints[keyPoints.length - 1]);
        // Remove the middle point to avoid the situation where the starting and ending positions are drawn back, such as when sourcePoint is between nextSourcePoint and the first key point.
        // Issue
        //                           keyPoint2
        //                                |
        //                                |
        // nextPoint---sourcePoint---keyPoint1
        // The correct rendering should be (nextPoint should be filtered out):
        //                           keyPoint2
        //                                |
        //                                |
        //             sourcePoint---keyPoint1
        const ret = simplifyOrthogonalPoints(renderPoints);
        return ret;
    }
};

export const getNextSourceAndTargetPoints = (board: PlaitBoard, element: PlaitLine) => {
    const options = getElbowLineRouteOptions(board, element);
    return [options.nextSourcePoint, options.nextTargetPoint];
};

export const getSourceAndTargetRectangle = (board: PlaitBoard, element: PlaitLine, handleRefPair: LineHandleRefPair) => {
    let sourceElement = element.source.boundId ? getElementById<PlaitGeometry>(board, element.source.boundId) : undefined;
    let targetElement = element.target.boundId ? getElementById<PlaitGeometry>(board, element.target.boundId) : undefined;
    if (!sourceElement) {
        const source = handleRefPair.source;
        sourceElement = createFakeElement(source.point, source.vector);
    }
    if (!targetElement) {
        const target = handleRefPair.target;
        targetElement = createFakeElement(target.point, target.vector);
    }
    const sourceRectangle = RectangleClient.inflate(getRectangleByPoints(sourceElement.points), getStrokeWidthByElement(sourceElement) * 2);
    const targetRectangle = RectangleClient.inflate(getRectangleByPoints(targetElement.points), getStrokeWidthByElement(targetElement) * 2);
    return {
        sourceRectangle,
        targetRectangle
    };
};

const createFakeElement = (startPoint: Point, vector: Vector) => {
    const point = getPointByVector(startPoint, vector, -25);
    const points = RectangleClient.getPoints(RectangleClient.createRectangleByCenterPoint(point, 50, 50));
    return createGeometryElement(BasicShapes.rectangle, points, '');
};

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

function findReferenceSegment(
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
            const p1 = PlaitBoard.getRoughSVG(board).rectangle(
                fakeRectangle.x,
                fakeRectangle.y,
                fakeRectangle.width,
                fakeRectangle.height,
                { stroke: 'blue' }
            );
            // PlaitBoard.getElementActiveHost(board).append(p1);
            return [startPoint, endPoint] as [Point, Point];
        }
    }
    return undefined;
}

export function getNextKeyPoints(board: PlaitBoard, element: PlaitLine, keyPoints?: Point[]) {
    let newKeyPoints = keyPoints ?? getElbowPoints(board, element);
    const [nextSourcePoint, nextTargetPoint] = getNextSourceAndTargetPoints(board, element);
    newKeyPoints.splice(0, 1, nextSourcePoint);
    newKeyPoints.splice(-1, 1, nextTargetPoint);
    return removeDuplicatePoints(newKeyPoints);
}
