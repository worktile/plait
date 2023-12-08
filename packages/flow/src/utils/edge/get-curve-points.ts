import { Direction, Point, distanceBetweenPointAndPoint } from '@plait/core';
import { pointsOnBezierCurves } from 'points-on-curve';
import { getDirectionFactor, getPointByVector } from '@plait/common';

export function getCurvePoints({
    sourceDirection = Direction.bottom,
    sourcePoint,
    targetDirection = Direction.top,
    targetPoint
}: {
    sourceDirection: Direction;
    sourcePoint: Point;
    targetDirection: Direction;
    targetPoint: Point;
}) {
    let curvePoints: Point[] = [sourcePoint];
    const sumDistance = distanceBetweenPointAndPoint(...sourcePoint, ...targetPoint);
    const offset = 12 + sumDistance / 3;

    const sourceFactor = getDirectionFactor(sourceDirection!);
    curvePoints.push(getPointByVector(sourcePoint, [sourceFactor.x, sourceFactor.y], offset));

    const targetFactor = getDirectionFactor(targetDirection);
    curvePoints.push(getPointByVector(targetPoint, [targetFactor.x, targetFactor.y], offset));

    curvePoints.push(targetPoint);
    return pointsOnBezierCurves(curvePoints) as Point[];
}
