import { generateElbowLineRoute, getNextPoint, reduceRouteMargin, getPoints } from '@plait/common';
import { Direction, Point, RectangleClient, XYPosition } from '@plait/core';
import { getHandleXYPosition } from '../handle/get-handle-position';

export function getSmoothPoints({
    sourceRectangle,
    sourcePosition = Direction.bottom,
    targetRectangle,
    targetPosition = Direction.top,
    offset
}: {
    sourceRectangle: RectangleClient;
    sourcePosition: Direction;
    targetRectangle: RectangleClient;
    targetPosition: Direction;
    offset: number;
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
    return points.map(item => {
        return {
            x: item[0],
            y: item[1]
        };
    });
}

export const getLabelPoints = (pathPoints: XYPosition[], segmentNumber: number = 2): XYPosition[] => {
    const points = [...pathPoints];
    const segmentDistances = [];
    let totalLength = 0;
    for (let i = 1; i < points.length; i++) {
        const dx = points[i].x - points[i - 1].x;
        const dy = points[i].y - points[i - 1].y;
        const length = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
        totalLength += length;
        segmentDistances.push(length);
    }
    const segmentLength = totalLength / segmentNumber;
    const segmentPoints: XYPosition[] = [];
    let _currentPoint = points[0];
    let _currentSegmentNumber = 2;
    let _remainingLength = segmentLength;
    let _usedLength = 0;
    let i = 0;

    while (i < points.length - 1) {
        const segmentDistance = segmentDistances[i];
        // 两点间距离包含剩余长度
        if (segmentDistance - _usedLength >= _remainingLength) {
            const directionX = points[i + 1].x === _currentPoint.x ? 0 : points[i + 1].x > _currentPoint.x ? 1 : -1;
            const directionY = points[i + 1].y === _currentPoint.y ? 0 : points[i + 1].y > _currentPoint.y ? 1 : -1;
            const x = _currentPoint.x + _remainingLength * directionX;
            const y = _currentPoint.y + _remainingLength * directionY;
            const segment = { x: x, y: y };
            segmentPoints.push(segment);
            _currentSegmentNumber++;
            if (_currentSegmentNumber > segmentNumber) {
                break;
            }
            _usedLength += Math.sqrt(Math.pow(x - _currentPoint.x, 2) + Math.pow(y - _currentPoint.y, 2));
            _currentPoint = segment;
            _remainingLength = segmentLength;
        } else {
            _currentPoint = points[i + 1];
            _remainingLength = _remainingLength - (segmentDistance - _usedLength);
            _usedLength = 0;
            i++;
        }
    }
    return segmentPoints;
};

const getDirection = ({
    source,
    sourcePosition = Direction.bottom,
    target
}: {
    source: XYPosition;
    sourcePosition: Direction;
    target: XYPosition;
}): XYPosition => {
    if (sourcePosition === Direction.left || sourcePosition === Direction.right) {
        return source.x < target.x ? { x: 1, y: 0 } : { x: -1, y: 0 };
    }
    return source.y < target.y ? { x: 0, y: 1 } : { x: 0, y: -1 };
};
