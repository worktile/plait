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
import { BasicShapes, PlaitGeometry, PlaitLine } from '../../interfaces';
import { createGeometryElement } from '../geometry';
import { getStrokeWidthByElement } from '../style/stroke';
import { getLineHandleRefPair } from './line-common';

export const getElbowPoints = (board: PlaitBoard, element: PlaitLine) => {
    const { sourceRectangle, targetRectangle } = getSourceAndTargetRectangle(board, element);
    const { sourceOuterRectangle, targetOuterRectangle } = getSourceAndTargetOuterRectangle(sourceRectangle, targetRectangle);
    const handleRefPair = getLineHandleRefPair(board, element);
    const sourcePoint = handleRefPair.source.point;
    const targetPoint = handleRefPair.target.point;
    const nextSourcePoint = getNextPoint(sourcePoint, sourceOuterRectangle, handleRefPair.source.direction);
    const nextTargetPoint = getNextPoint(targetPoint, targetOuterRectangle, handleRefPair.target.direction);
    const params = {
        sourcePoint,
        nextSourcePoint,
        sourceRectangle,
        sourceOuterRectangle,
        targetPoint,
        nextTargetPoint,
        targetRectangle,
        targetOuterRectangle
    };
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

        // adjust first custom point
        const targetIndex = 1;
        const firstPoint = dataPoints[0];
        const secondPoint = dataPoints[targetIndex];
        const thirdPoint = dataPoints[2];
        const isStraightWithPreviousPoint = isPointsOnSameLine([firstPoint, secondPoint]);
        if (!isStraightWithPreviousPoint) {
            const midKeyPoints = getMidKeyPoints(simplifiedNextKeyPoints, firstPoint, secondPoint);
            if (midKeyPoints.length === 0) {
                const segment = [secondPoint, thirdPoint] as [Point, Point];
                const parallelSegments = findOrthogonalParallelSegments(segment, simplifiedNextKeyPoints);
                const referenceSegment = findReferenceSegment(board, segment, parallelSegments, sourceRectangle, targetRectangle);
                if (referenceSegment) {
                    dataPoints.splice(targetIndex, 2, ...referenceSegment);
                } else {
                    const isHorizontal = Point.isHorizontalAlign(secondPoint, thirdPoint);
                    const adjustIndex = isHorizontal ? 0 : 1;
                    const newSecondPoint = [secondPoint[0], secondPoint[1]] as Point;
                    newSecondPoint[adjustIndex] = firstPoint[adjustIndex];
                    dataPoints.splice(targetIndex, 1, newSecondPoint);
                }
            }
        }
        // adjust following points
        // because the reference lines are different, the processing of the first custom point and the following points will increase the cost of understanding, so the implementation is separated.
        for (let index = 0; index < dataPoints.length - 1; index++) {
            let previousPoint = dataPoints[index - 1];
            let currentPoint = dataPoints[index];
            let nextPoint = dataPoints[index + 1];
            const isStraight = isPointsOnSameLine([currentPoint, nextPoint]);
            if (!isStraight) {
                const midKeyPoints = getMidKeyPoints(simplifiedNextKeyPoints, currentPoint, nextPoint);
                if (midKeyPoints.length) {
                    renderPoints.push(currentPoint);
                    renderPoints.push(...midKeyPoints);
                } else {
                    const segment = [previousPoint, currentPoint] as [Point, Point];
                    const parallelSegments = findOrthogonalParallelSegments(segment, simplifiedNextKeyPoints);
                    const referenceSegment = findReferenceSegment(board, segment, parallelSegments, sourceRectangle, targetRectangle);
                    if (referenceSegment) {
                        const newCurrentPoint = referenceSegment[1];
                        const isNewStraight = isPointsOnSameLine([newCurrentPoint, nextPoint]);
                        renderPoints.push(newCurrentPoint);
                        if (!isNewStraight) {
                            const newMidElbowPoints = getMidKeyPoints(simplifiedNextKeyPoints, newCurrentPoint, nextPoint);
                            if (newMidElbowPoints && newMidElbowPoints.length > 0) {
                                renderPoints.push(...newMidElbowPoints);
                            } else {
                                console.error(
                                    'Unhandled exception, orthogonal connection still cannot be obtained after correction based on parallel lines'
                                );
                            }
                        }
                        dataPoints.splice(index - 1, 2, ...referenceSegment);
                    } else {
                        const isHorizontalWithPreviousPoint = Point.isHorizontalAlign(previousPoint, currentPoint);
                        const adjustIndex = isHorizontalWithPreviousPoint ? 0 : 1;
                        const newCurrentPoint = [currentPoint[0], currentPoint[1]] as Point;
                        newCurrentPoint[adjustIndex] = nextPoint[adjustIndex];
                        dataPoints.splice(index, 1, newCurrentPoint);
                        renderPoints.push(dataPoints[index]);
                    }
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
        return simplifyOrthogonalPoints(renderPoints);
    }
};

export const getNextSourceAndTargetPoints = (board: PlaitBoard, element: PlaitLine) => {
    const { sourceRectangle, targetRectangle } = getSourceAndTargetRectangle(board, element);
    const { sourceOuterRectangle, targetOuterRectangle } = getSourceAndTargetOuterRectangle(sourceRectangle, targetRectangle);
    const handleRefPair = getLineHandleRefPair(board, element);
    const sourcePoint = handleRefPair.source.point;
    const targetPoint = handleRefPair.target.point;
    const nextSourcePoint = getNextPoint(sourcePoint, sourceOuterRectangle, handleRefPair.source.direction);
    const nextTargetPoint = getNextPoint(targetPoint, targetOuterRectangle, handleRefPair.target.direction);
    return [nextSourcePoint, nextTargetPoint];
};

export const getSourceAndTargetRectangle = (board: PlaitBoard, element: PlaitLine) => {
    const handleRefPair = getLineHandleRefPair(board, element);
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
        const isHorizontal = Point.isHorizontalAlign(current, next);
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
