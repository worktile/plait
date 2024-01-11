import { generateElbowLineRoute, getNextPoint, getPoints, getSourceAndTargetOuterRectangle } from '@plait/common';
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

    const isIntersect =
        RectangleClient.isPointInRectangle(targetRectangle, sourcePoint) ||
        RectangleClient.isPointInRectangle(targetOuterRectangle, nextSourcePoint) ||
        RectangleClient.isPointInRectangle(sourceOuterRectangle, nextTargetPoint) ||
        RectangleClient.isPointInRectangle(sourceRectangle, targetPoint);
    if (!isIntersect) {
        points = generateElbowLineRoute({
            sourcePoint,
            nextSourcePoint,
            sourceRectangle,
            sourceOuterRectangle,
            targetPoint,
            nextTargetPoint,
            targetRectangle,
            targetOuterRectangle
        });
    } else {
        points = getPoints(sourcePoint, sourceDirection, targetPoint, targetDirection, offset);
    }
    return points;
}
