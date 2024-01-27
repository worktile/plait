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
import { getMidKeyPoints, getMirrorDataPoints } from './line-resize';

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
        const nextDataPoints = [
            simplifiedNextKeyPoints[0],
            ...dataPoints.slice(1, -1),
            simplifiedNextKeyPoints[simplifiedNextKeyPoints.length - 1]
        ];
        const mirrorDataPoints = getMirrorDataPoints(board, nextDataPoints, simplifiedNextKeyPoints, params);
        const renderPoints: Point[] = [keyPoints[0]];
        for (let index = 0; index < mirrorDataPoints.length - 1; index++) {
            let currentPoint = mirrorDataPoints[index];
            let nextPoint = mirrorDataPoints[index + 1];
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

export function getNextKeyPoints(board: PlaitBoard, element: PlaitLine, keyPoints?: Point[]) {
    let newKeyPoints = keyPoints ?? getElbowPoints(board, element);
    const [nextSourcePoint, nextTargetPoint] = getNextSourceAndTargetPoints(board, element);
    newKeyPoints.splice(0, 1, nextSourcePoint);
    newKeyPoints.splice(-1, 1, nextTargetPoint);
    return removeDuplicatePoints(newKeyPoints);
}
