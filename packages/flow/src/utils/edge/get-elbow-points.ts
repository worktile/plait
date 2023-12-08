import { generateElbowLineRoute, getNextPoint, reduceRouteMargin, getPoints } from '@plait/common';
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
    const { sourceOffset, targetOffset } = reduceRouteMargin(sourceRectangle, targetRectangle);
    const sourceOuterRectangle = RectangleClient.expand(
        sourceRectangle,
        sourceOffset[3],
        sourceOffset[0],
        sourceOffset[1],
        sourceOffset[2]
    );
    const targetOuterRectangle = RectangleClient.expand(
        targetRectangle,
        targetOffset[3],
        targetOffset[0],
        targetOffset[1],
        targetOffset[2]
    );
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
