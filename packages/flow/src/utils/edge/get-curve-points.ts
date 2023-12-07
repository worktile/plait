import { Direction, Point, RectangleClient, distanceBetweenPointAndPoint } from '@plait/core';
import { pointsOnBezierCurves } from 'points-on-curve';
import { getHandleXYPosition } from '../handle/get-handle-position';
import { getDirectionFactor, getPointByVector } from '@plait/common';

export function getCurvePoints({
    sourceRectangle,
    sourcePosition = Direction.bottom,
    targetRectangle,
    targetPosition = Direction.top
}: {
    sourceRectangle: RectangleClient;
    sourcePosition: Direction;
    targetRectangle: RectangleClient;
    targetPosition: Direction;
}) {
    const sourceXYPosition = getHandleXYPosition(sourcePosition, sourceRectangle);
    const targetXYPosition = getHandleXYPosition(targetPosition, targetRectangle);
    const sourcePoint: Point = [sourceXYPosition.x, sourceXYPosition.y];
    const targetPoint: Point = [targetXYPosition.x, targetXYPosition.y];

    let curvePoints: Point[] = [sourcePoint];
    const sumDistance = distanceBetweenPointAndPoint(...sourcePoint, ...targetPoint);
    const offset = 12 + sumDistance / 3;

    const sourceFactor = getDirectionFactor(sourcePosition!);
    curvePoints.push(getPointByVector(sourcePoint, [sourceFactor.x, sourceFactor.y], offset));

    const targetFactor = getDirectionFactor(targetPosition);
    curvePoints.push(getPointByVector(targetPoint, [targetFactor.x, targetFactor.y], offset));

    curvePoints.push(targetPoint);
    return pointsOnBezierCurves(curvePoints) as Point[];
}
