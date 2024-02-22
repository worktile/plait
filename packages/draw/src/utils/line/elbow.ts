import { Point, PlaitBoard, getElementById, RectangleClient, Vector } from '@plait/core';
import {
    getPoints,
    getPointByVector,
    removeDuplicatePoints,
    generateElbowLineRoute,
    simplifyOrthogonalPoints,
    isSourceAndTargetIntersect
} from '@plait/common';
import { BasicShapes, LineHandleRefPair, PlaitGeometry, PlaitLine } from '../../interfaces';
import { createGeometryElement } from '../geometry';
import { getStrokeWidthByElement } from '../style/stroke';
import { getElbowLineRouteOptions, getLineHandleRefPair } from './line-common';
import { getMidKeyPoints, getMirrorDataPoints, hasIllegalElbowPoint } from './line-resize';

export const getElbowPoints = (board: PlaitBoard, element: PlaitLine) => {
    const handleRefPair = getLineHandleRefPair(board, element);
    const params = getElbowLineRouteOptions(board, element, handleRefPair);
    // console.log(params, 'params');
    const isIntersect = isSourceAndTargetIntersect(params);
    if (isIntersect) {
        return simplifyOrthogonalPoints(
            getPoints(
                handleRefPair.source.point,
                handleRefPair.source.direction,
                handleRefPair.target.point,
                handleRefPair.target.direction,
                0
            )
        );
    }
    const keyPoints = removeDuplicatePoints(generateElbowLineRoute(params));
    const nextKeyPoints = keyPoints.slice(1, keyPoints.length - 1);
    if (element.points.length === 2) {
        return simplifyOrthogonalPoints(keyPoints);
    } else {
        const simplifiedNextKeyPoints = simplifyOrthogonalPoints(nextKeyPoints);
        const dataPoints = removeDuplicatePoints(PlaitLine.getPoints(board, element));
        const midDataPoints = dataPoints.slice(1, -1);
        if (hasIllegalElbowPoint(midDataPoints)) {
            return simplifyOrthogonalPoints(keyPoints);
        }
        
        const nextDataPoints = [simplifiedNextKeyPoints[0], ...midDataPoints, simplifiedNextKeyPoints[simplifiedNextKeyPoints.length - 1]];
        const mirrorDataPoints = getMirrorDataPoints(board, nextDataPoints, simplifiedNextKeyPoints, params);
        // console.log(mirrorDataPoints, 'mirrorDataPoints');
        const renderPoints: Point[] = [keyPoints[0]];
        for (let index = 0; index < mirrorDataPoints.length - 1; index++) {
            let currentPoint = mirrorDataPoints[index];
            let nextPoint = mirrorDataPoints[index + 1];
            const isStraight = Point.isAlign([currentPoint, nextPoint]);
            if (!isStraight) {
                const midKeyPoints = getMidKeyPoints(simplifiedNextKeyPoints, currentPoint, nextPoint);
                if (midKeyPoints.length) {
                    renderPoints.push(currentPoint);
                    renderPoints.push(...midKeyPoints);
                } else {
                    renderPoints.push(currentPoint);
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
    const sourceRectangle = RectangleClient.inflate(
        RectangleClient.getRectangleByPoints(sourceElement.points),
        getStrokeWidthByElement(sourceElement) * 2
    );
    const targetRectangle = RectangleClient.inflate(
        RectangleClient.getRectangleByPoints(targetElement.points),
        getStrokeWidthByElement(targetElement) * 2
    );
    return {
        sourceRectangle,
        targetRectangle
    };
};

const createFakeElement = (startPoint: Point, vector: Vector) => {
    const point = getPointByVector(startPoint, vector, -25);
    const points = RectangleClient.getPoints(RectangleClient.getRectangleByCenterPoint(point, 50, 50));
    return createGeometryElement(BasicShapes.rectangle, points, '');
};

export function getNextRenderPoints(board: PlaitBoard, element: PlaitLine, renderPoints?: Point[]) {
    let newRenderKeyPoints = renderPoints ?? getElbowPoints(board, element);
    const [nextSourcePoint, nextTargetPoint] = getNextSourceAndTargetPoints(board, element);
    newRenderKeyPoints.splice(0, 1, nextSourcePoint);
    newRenderKeyPoints.splice(-1, 1, nextTargetPoint);
    return removeDuplicatePoints(newRenderKeyPoints);
}
