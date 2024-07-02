import { Point, PlaitBoard, getElementById, RectangleClient, Vector, rotatePoints, rotatePointsByElement } from '@plait/core';
import {
    getPoints,
    getPointByVectorComponent,
    removeDuplicatePoints,
    generateElbowLineRoute,
    simplifyOrthogonalPoints,
    isSourceAndTargetIntersect,
    DEFAULT_ROUTE_MARGIN,
    ElbowLineRouteOptions
} from '@plait/common';
import { BasicShapes, ArrowLineHandleRefPair, PlaitGeometry, PlaitArrowLine } from '../../interfaces';
import { createGeometryElement } from '../geometry';
import { getElbowLineRouteOptions, getArrowLineHandleRefPair } from './arrow-line-common';
import { getMidKeyPoints, getMirrorDataPoints, hasIllegalElbowPoint } from './arrow-line-resize';
import { getStrokeWidthByElement } from '../common';

export const isSelfLoop = (element: PlaitArrowLine) => {
    return element.source.boundId && element.source.boundId === element.target.boundId;
};

export const isUseDefaultOrthogonalRoute = (element: PlaitArrowLine, options: ElbowLineRouteOptions) => {
    return isSourceAndTargetIntersect(options) && !isSelfLoop(element);
};

export const getElbowPoints = (board: PlaitBoard, element: PlaitArrowLine) => {
    const handleRefPair = getArrowLineHandleRefPair(board, element);
    const params = getElbowLineRouteOptions(board, element, handleRefPair);
    // console.log(params, 'params');
    if (isUseDefaultOrthogonalRoute(element, params)) {
        return simplifyOrthogonalPoints(
            getPoints(
                handleRefPair.source.point,
                handleRefPair.source.direction,
                handleRefPair.target.point,
                handleRefPair.target.direction,
                DEFAULT_ROUTE_MARGIN
            )
        );
    }
    const keyPoints = removeDuplicatePoints(generateElbowLineRoute(params, board));
    const nextKeyPoints = keyPoints.slice(1, keyPoints.length - 1);
    if (element.points.length === 2) {
        return simplifyOrthogonalPoints(keyPoints);
    } else {
        const simplifiedNextKeyPoints = simplifyOrthogonalPoints(nextKeyPoints);
        const dataPoints = removeDuplicatePoints(PlaitArrowLine.getPoints(board, element));
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

export const getNextSourceAndTargetPoints = (board: PlaitBoard, element: PlaitArrowLine) => {
    const options = getElbowLineRouteOptions(board, element);
    return [options.nextSourcePoint, options.nextTargetPoint];
};

export const getSourceAndTargetRectangle = (board: PlaitBoard, element: PlaitArrowLine, handleRefPair: ArrowLineHandleRefPair) => {
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

    let sourceRectangle = RectangleClient.getRectangleByPoints(sourceElement.points);
    const rotatedSourceCornerPoints =
        rotatePointsByElement(RectangleClient.getCornerPoints(sourceRectangle), sourceElement) ||
        RectangleClient.getCornerPoints(sourceRectangle);
    sourceRectangle = RectangleClient.getRectangleByPoints(rotatedSourceCornerPoints);
    sourceRectangle = RectangleClient.inflate(sourceRectangle, getStrokeWidthByElement(sourceElement) * 2);

    let targetRectangle = RectangleClient.getRectangleByPoints(targetElement.points);
    const rotatedTargetCornerPoints =
        rotatePointsByElement(RectangleClient.getCornerPoints(targetRectangle), targetElement) ||
        RectangleClient.getCornerPoints(targetRectangle);
    targetRectangle = RectangleClient.getRectangleByPoints(rotatedTargetCornerPoints);
    targetRectangle = RectangleClient.inflate(targetRectangle, getStrokeWidthByElement(targetElement) * 2);

    return {
        sourceRectangle,
        targetRectangle
    };
};

const createFakeElement = (startPoint: Point, vector: Vector) => {
    const point = getPointByVectorComponent(startPoint, vector, -25);
    const points = RectangleClient.getPoints(RectangleClient.getRectangleByCenterPoint(point, 50, 50));
    return createGeometryElement(BasicShapes.rectangle, points, '');
};

export function getNextRenderPoints(board: PlaitBoard, element: PlaitArrowLine, renderPoints?: Point[]) {
    let newRenderKeyPoints = renderPoints ?? getElbowPoints(board, element);
    const [nextSourcePoint, nextTargetPoint] = getNextSourceAndTargetPoints(board, element);
    newRenderKeyPoints.splice(0, 1, nextSourcePoint);
    newRenderKeyPoints.splice(-1, 1, nextTargetPoint);
    return removeDuplicatePoints(newRenderKeyPoints);
}
