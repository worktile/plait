import { Direction, Point, distanceBetweenPointAndPoint } from '@plait/core';
import { getDirectionFactor } from './direction';

export function getOppositeDirection(direction: Direction) {
    switch (direction) {
        case Direction.left:
            return Direction.right;
        case Direction.right:
            return Direction.left;
        case Direction.top:
            return Direction.bottom;
        case Direction.bottom:
            return Direction.top;
    }
}

export const getPoints = (source: Point, sourcePosition: Direction, target: Point, targetPosition: Direction, offset: number) => {
    const sourceDir = getDirectionFactor(sourcePosition);
    const targetDir = getDirectionFactor(targetPosition);
    const sourceGapped: Point = [source[0] + sourceDir.x * offset, source[1] + sourceDir.y * offset];
    const targetGapped: Point = [target[0] + targetDir.x * offset, target[1] + targetDir.y * offset];
    const dir = getDirection(sourceGapped, sourcePosition, targetGapped);
    const dirAccessor = dir.x !== 0 ? 'x' : 'y';
    const currDir = dir[dirAccessor];

    let points: Point[] = [];
    let centerX, centerY;
    const [defaultCenterX, defaultCenterY] = getEdgeCenter({
        sourceX: source[0],
        sourceY: source[1],
        targetX: target[0],
        targetY: target[1]
    });
    // opposite handle positions, default case
    if (sourceDir[dirAccessor] * targetDir[dirAccessor] === -1) {
        centerX = defaultCenterX;
        centerY = defaultCenterY;
        //    --->
        //    |
        // >---
        const verticalSplit: Point[] = [
            [centerX, sourceGapped[1]],
            [centerX, targetGapped[1]]
        ];
        //    |
        //  ---
        //  |
        const horizontalSplit: Point[] = [
            [sourceGapped[0], centerY],
            [targetGapped[0], centerY]
        ];
        if (sourceDir[dirAccessor] === currDir) {
            points = dirAccessor === 'x' ? verticalSplit : horizontalSplit;
        } else {
            points = dirAccessor === 'x' ? horizontalSplit : verticalSplit;
        }
    } else {
        // sourceTarget means we take x from source and y from target, targetSource is the opposite
        const sourceTarget: Point[] = [[sourceGapped[0], targetGapped[1]]];
        const targetSource: Point[] = [[targetGapped[0], sourceGapped[1]]];
        // this handles edges with same handle positions
        if (dirAccessor === 'x') {
            points = sourceDir.x === currDir ? targetSource : sourceTarget;
        } else {
            points = sourceDir.y === currDir ? sourceTarget : targetSource;
        }

        // these are conditions for handling mixed handle positions like right -> bottom for example
        let flipSourceTarget;
        if (sourcePosition !== targetPosition) {
            const dirAccessorOpposite = dirAccessor === 'x' ? 1 : 0;
            const isSameDir = sourceDir[dirAccessor] === targetDir[dirAccessor === 'x' ? 'y' : 'x'];
            const sourceGtTargetOppo = sourceGapped[dirAccessorOpposite] > targetGapped[dirAccessorOpposite];
            const sourceLtTargetOppo = sourceGapped[dirAccessorOpposite] < targetGapped[dirAccessorOpposite];
            flipSourceTarget =
                (sourceDir[dirAccessor] === 1 && ((!isSameDir && sourceGtTargetOppo) || (isSameDir && sourceLtTargetOppo))) ||
                (sourceDir[dirAccessor] !== 1 && ((!isSameDir && sourceLtTargetOppo) || (isSameDir && sourceGtTargetOppo)));

            if (flipSourceTarget) {
                points = dirAccessor === 'x' ? sourceTarget : targetSource;
            }
        }
    }
    return [source, sourceGapped, ...points, targetGapped, target];
};

export const getDirection = (source: Point, sourcePosition = Direction.bottom, target: Point) => {
    if (sourcePosition === Direction.left || sourcePosition === Direction.right) {
        return source[0] < target[0] ? { x: 1, y: 0 } : { x: -1, y: 0 };
    }
    return source[1] < target[1] ? { x: 0, y: 1 } : { x: 0, y: -1 };
};

export function getEdgeCenter({
    sourceX,
    sourceY,
    targetX,
    targetY
}: {
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
}): [number, number, number, number] {
    const xOffset = Math.abs(targetX - sourceX) / 2;
    const centerX = targetX < sourceX ? targetX + xOffset : targetX - xOffset;

    const yOffset = Math.abs(targetY - sourceY) / 2;
    const centerY = targetY < sourceY ? targetY + yOffset : targetY - yOffset;

    return [centerX, centerY, xOffset, yOffset];
}

export function getPointOnPolyline(points: Point[], ratio: number) {
    const totalLength = calculatePolylineLength(points);
    const targetDistance = totalLength * ratio;

    let accumulatedDistance = 0;
    for (let i = 0; i < points.length - 1; i++) {
        const [x1, y1] = points[i];
        const [x2, y2] = points[i + 1];
        const segmentLength = distanceBetweenPointAndPoint(x1, y1, x2, y2);

        if (accumulatedDistance + segmentLength >= targetDistance) {
            const remainingDistance = targetDistance - accumulatedDistance;
            const ratioInSegment = remainingDistance / segmentLength;

            const targetX = x1 + (x2 - x1) * ratioInSegment;
            const targetY = y1 + (y2 - y1) * ratioInSegment;
            return [targetX, targetY];
        }

        accumulatedDistance += segmentLength;
    }

    return points[points.length - 1];
}

export function calculatePolylineLength(points: Point[]) {
    let length = 0;
    for (let i = 0; i < points.length - 1; i++) {
        const [x1, y1] = points[i];
        const [x2, y2] = points[i + 1];
        length += distanceBetweenPointAndPoint(x1, y1, x2, y2);
    }
    return length;
}

export function getRatioByPoint(points: Point[], point: Point) {
    const totalLength = calculatePolylineLength(points);

    let distance = 0;

    for (let i = 0; i < points.length - 1; i++) {
        const isOverlap = isPointOnLineSegment(point, points[i], points[i + 1]);

        if (isOverlap) {
            distance += distanceBetweenPointAndPoint(point[0], point[1], points[i][0], points[i][1]);
            return distance / totalLength;
        } else {
            distance += distanceBetweenPointAndPoint(points[i][0], points[i][1], points[i + 1][0], points[i + 1][1]);
        }
    }
    throw new Error('Cannot get ratio by point');
}

export function isPointOnLineSegment(point: Point, startPoint: Point, endPoint: Point) {
    const distanceToStart = distanceBetweenPointAndPoint(point[0], point[1], startPoint[0], startPoint[1]);
    const distanceToEnd = distanceBetweenPointAndPoint(point[0], point[1], endPoint[0], endPoint[1]);

    const segmentLength = distanceBetweenPointAndPoint(startPoint[0], startPoint[1], endPoint[0], endPoint[1]);

    return Math.abs(distanceToStart + distanceToEnd - segmentLength) < 0.1;
}
