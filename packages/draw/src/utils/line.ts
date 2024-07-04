import { PlaitBoard, Point, distanceBetweenPointAndPoint } from '@plait/core';
import { PlaitLine } from '../interfaces/line';
import { ArrowLineShape, PlaitArrowLine, PlaitDrawElement } from '../interfaces';
import {
    getArrowLinePoints,
    getCurvePoints,
    getElbowLineRouteOptions,
    getElbowPoints,
    getNextSourceAndTargetPoints,
    isUseDefaultOrthogonalRoute
} from './arrow-line';
import { getVectorLinePoints } from './vector-line';

export const getLinePoints = (board: PlaitBoard, element: PlaitLine) => {
    if (PlaitDrawElement.isArrowLine(element)) {
        return getArrowLinePoints(board, element);
    } else {
        return getVectorLinePoints(board, element);
    }
};

export function getMiddlePoints(board: PlaitBoard, element: PlaitLine) {
    const result: Point[] = [];
    const shape = element.shape;
    const hideBuffer = 10;
    if (shape === ArrowLineShape.straight) {
        const points = PlaitArrowLine.getPoints(board, element);
        for (let i = 0; i < points.length - 1; i++) {
            const distance = distanceBetweenPointAndPoint(...points[i], ...points[i + 1]);
            if (distance < hideBuffer) continue;
            result.push([(points[i][0] + points[i + 1][0]) / 2, (points[i][1] + points[i + 1][1]) / 2]);
        }
    }
    if (shape === ArrowLineShape.curve) {
        const points = PlaitArrowLine.getPoints(board, element);
        const pointsOnBezier = getCurvePoints(board, element);
        if (points.length === 2) {
            const start = 0;
            const endIndex = pointsOnBezier.length - 1;
            const middleIndex = Math.round((start + endIndex) / 2);
            result.push(pointsOnBezier[middleIndex]);
        } else {
            for (let i = 0; i < points.length - 1; i++) {
                const startIndex = pointsOnBezier.findIndex(point => point[0] === points[i][0] && point[1] === points[i][1]);
                const endIndex = pointsOnBezier.findIndex(point => point[0] === points[i + 1][0] && point[1] === points[i + 1][1]);
                const middleIndex = Math.round((startIndex + endIndex) / 2);
                const distance = distanceBetweenPointAndPoint(...points[i], ...points[i + 1]);
                if (distance < hideBuffer) continue;
                result.push(pointsOnBezier[middleIndex]);
            }
        }
    }
    if (shape === ArrowLineShape.elbow) {
        const renderPoints = getElbowPoints(board, element);
        const options = getElbowLineRouteOptions(board, element);
        if (!isUseDefaultOrthogonalRoute(element, options)) {
            const [nextSourcePoint, nextTargetPoint] = getNextSourceAndTargetPoints(board, element);
            for (let i = 0; i < renderPoints.length - 1; i++) {
                if (
                    (i == 0 && Point.isEquals(renderPoints[i + 1], nextSourcePoint)) ||
                    (i === renderPoints.length - 2 && Point.isEquals(renderPoints[renderPoints.length - 2], nextTargetPoint))
                ) {
                    continue;
                }
                const [currentX, currentY] = renderPoints[i];
                const [nextX, nextY] = renderPoints[i + 1];
                const middlePoint = [(currentX + nextX) / 2, (currentY + nextY) / 2] as Point;
                result.push(middlePoint);
            }
        }
    }
    return result;
}
