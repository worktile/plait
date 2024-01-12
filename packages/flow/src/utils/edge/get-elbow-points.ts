import {
    ElbowLineRouteOptions,
    generateElbowLineRoute,
    getNextPoint,
    getPoints,
    getSourceAndTargetOuterRectangle,
    isSourceAndTargetIntersect
} from '@plait/common';
import { Direction, Point, RectangleClient } from '@plait/core';

export function getElbowPoints({
    sourceRectangle,
    sourcePoint,
    sourceDirection = Direction.bottom,
    targetRectangle,
    targetPoint,
    targetDirection = Direction.top,
    offset = 30
}: {
    sourceRectangle: RectangleClient;
    sourceDirection: Direction;
    sourcePoint: Point;
    targetRectangle: RectangleClient;
    targetDirection: Direction;
    targetPoint: Point;
    offset?: number;
}) {
    let points: Point[] = [];
    const { sourceOuterRectangle, targetOuterRectangle } = getSourceAndTargetOuterRectangle(sourceRectangle, targetRectangle);
    const nextSourcePoint = getNextPoint(sourcePoint, sourceOuterRectangle, sourceDirection);
    const nextTargetPoint = getNextPoint(targetPoint, targetOuterRectangle, targetDirection);

    const params: ElbowLineRouteOptions = {
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
    if (!isIntersect) {
        points = generateElbowLineRoute(params);
    } else {
        points = getPoints(sourcePoint, sourceDirection, targetPoint, targetDirection, offset);
    }
    return points;
}
