import { Direction, Point, RectangleClient } from '@plait/core';
import { getHandleXYPosition } from '../handle/get-handle-position';

export function getStraightPoints({
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
    return [sourcePoint, targetPoint];
}
