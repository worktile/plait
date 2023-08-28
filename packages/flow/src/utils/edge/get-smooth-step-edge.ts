import { FlowPosition } from '../../interfaces/element';
import { getEdgeCenter } from './edge';
import { XYPosition } from '@plait/core';

const handleDirections = {
    [FlowPosition.left]: { x: -1, y: 0 },
    [FlowPosition.right]: { x: 1, y: 0 },
    [FlowPosition.top]: { x: 0, y: -1 },
    [FlowPosition.bottom]: { x: 0, y: 1 }
};

// ith this function we try to mimic a orthogonal edge routing behaviour
// It's not as good as a real orthogonal edge routing but it's faster and good enough as a default for step and smooth step edges
export function getPoints({
    source,
    sourcePosition = FlowPosition.bottom,
    target,
    targetPosition = FlowPosition.top,
    offset
}: {
    source: XYPosition;
    sourcePosition: FlowPosition;
    target: XYPosition;
    targetPosition: FlowPosition;
    offset: number;
}): XYPosition[] {
    const sourceDir = handleDirections[sourcePosition];
    const targetDir = handleDirections[targetPosition];
    const sourceGapped: XYPosition = { x: source.x + sourceDir.x * offset, y: source.y + sourceDir.y * offset };
    const targetGapped: XYPosition = { x: target.x + targetDir.x * offset, y: target.y + targetDir.y * offset };
    const dir = getDirection({
        source: sourceGapped,
        sourcePosition,
        target: targetGapped
    });
    const dirAccessor = dir.x !== 0 ? 'x' : 'y';
    const currDir = dir[dirAccessor];

    let points: XYPosition[] = [];
    const [defaultCenterX, defaultCenterY] = getEdgeCenter({
        sourceX: source.x,
        sourceY: source.y,
        targetX: target.x,
        targetY: target.y
    });
    // opposite handle positions, default case
    if (sourceDir[dirAccessor] * targetDir[dirAccessor] === -1) {
        //    --->
        //    |
        // >---
        const verticalSplit: XYPosition[] = [
            { x: defaultCenterX, y: sourceGapped.y },
            { x: defaultCenterX, y: targetGapped.y }
        ];
        //    |
        //  ---
        //  |
        const horizontalSplit: XYPosition[] = [
            { x: sourceGapped.x, y: defaultCenterY },
            { x: targetGapped.x, y: defaultCenterY }
        ];
        if (sourceDir[dirAccessor] === currDir) {
            points = dirAccessor === 'x' ? verticalSplit : horizontalSplit;
        } else {
            points = dirAccessor === 'x' ? horizontalSplit : verticalSplit;
        }
    } else {
        // sourceTarget means we take x from source and y from target, targetSource is the opposite
        const sourceTarget: XYPosition[] = [{ x: sourceGapped.x, y: targetGapped.y }];
        const targetSource: XYPosition[] = [{ x: targetGapped.x, y: sourceGapped.y }];
        // this handles edges with same handle positions
        if (dirAccessor === 'x') {
            points = sourceDir.x === currDir ? targetSource : sourceTarget;
        } else {
            points = sourceDir.y === currDir ? sourceTarget : targetSource;
        }

        // these are conditions for handling mixed handle positions like right -> bottom for example
        if (sourcePosition !== targetPosition) {
            const dirAccessorOpposite = dirAccessor === 'x' ? 'y' : 'x';
            const isSameDir = sourceDir[dirAccessor] === targetDir[dirAccessorOpposite];
            const sourceGtTargetOppo = sourceGapped[dirAccessorOpposite] > targetGapped[dirAccessorOpposite];
            const sourceLtTargetOppo = sourceGapped[dirAccessorOpposite] < targetGapped[dirAccessorOpposite];
            const flipSourceTarget =
                (sourceDir[dirAccessor] === 1 && ((!isSameDir && sourceGtTargetOppo) || (isSameDir && sourceLtTargetOppo))) ||
                (sourceDir[dirAccessor] !== 1 && ((!isSameDir && sourceLtTargetOppo) || (isSameDir && sourceGtTargetOppo)));

            if (flipSourceTarget) {
                points = dirAccessor === 'x' ? sourceTarget : targetSource;
            }
        }
    }

    const pathPoints = [source, sourceGapped, ...points, targetGapped, target];
    return pathPoints;
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
        const dx = points[i + 1].x - _currentPoint.x;
        const dy = points[i + 1].y - _currentPoint.y;
        const segmentDistance = segmentDistances[i];
        // 两点间距离包含剩余长度
        if (segmentDistance - _usedLength >= _remainingLength) {
            // 剩余长度占当前距离的比例
            const ratio = _remainingLength / (segmentDistance - _usedLength);
            const x = Number((_currentPoint.x + dx * ratio).toFixed(2));
            const y = Number((_currentPoint.y + dy * ratio).toFixed(2));
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
    sourcePosition = FlowPosition.bottom,
    target
}: {
    source: XYPosition;
    sourcePosition: FlowPosition;
    target: XYPosition;
}): XYPosition => {
    if (sourcePosition === FlowPosition.left || sourcePosition === FlowPosition.right) {
        return source.x < target.x ? { x: 1, y: 0 } : { x: -1, y: 0 };
    }
    return source.y < target.y ? { x: 0, y: 1 } : { x: 0, y: -1 };
};

const distance = (a: XYPosition, b: XYPosition) => Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));

export function getBend(a: XYPosition, b: XYPosition, c: XYPosition, size: number): string {
    const bendSize = Math.min(distance(a, b) / 2, distance(b, c) / 2, size);
    const { x, y } = b;

    // no bend
    if ((a.x === x && x === c.x) || (a.y === y && y === c.y)) {
        return `L${x} ${y}`;
    }

    // first segment is horizontal
    if (a.y === y) {
        const xDir = a.x < c.x ? -1 : 1;
        const yDir = a.y < c.y ? 1 : -1;
        return `L ${x + bendSize * xDir},${y}Q ${x},${y} ${x},${y + bendSize * yDir}`;
    }

    const xDir = a.x < c.x ? 1 : -1;
    const yDir = a.y < c.y ? -1 : 1;
    return `L ${x},${y + bendSize * yDir}Q ${x},${y} ${x + bendSize * xDir},${y}`;
}
