import { generateElbowLineRoute, getNextPoint, reduceRouteMargin, getPoints } from '@plait/common';
import { Direction, Point, RectangleClient } from '@plait/core';
import { getHandleXYPosition } from '../handle/get-handle-position';

export function getElbowPoints({
    sourceRectangle,
    sourcePosition = Direction.bottom,
    targetRectangle,
    targetPosition = Direction.top,
    offset = 30
}: {
    sourceRectangle: RectangleClient;
    sourcePosition: Direction;
    targetRectangle: RectangleClient;
    targetPosition: Direction;
    offset?: number;
}) {
    let points: Point[] = [];
    const sourceXYPosition = getHandleXYPosition(sourcePosition, sourceRectangle);
    const targetXYPosition = getHandleXYPosition(targetPosition, targetRectangle);
    const sourcePoint: Point = [sourceXYPosition.x, sourceXYPosition.y];
    const targetPoint: Point = [targetXYPosition.x, targetXYPosition.y];
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
    const nextSourcePoint = getNextPoint(sourcePoint, sourceOuterRectangle, sourcePosition);
    const nextTargetPoint = getNextPoint(targetPoint, targetOuterRectangle, targetPosition);

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
        points = getPoints(sourcePoint, sourcePosition, targetPoint, targetPosition, offset);
    }
    return points;
}
