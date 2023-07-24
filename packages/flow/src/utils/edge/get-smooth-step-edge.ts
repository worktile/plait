import { FlowEdge } from '@plait/flow';
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
    center,
    offset,
    samePositionEdges,
    currentEdgeIndex
}: {
    source: XYPosition;
    sourcePosition: FlowPosition;
    target: XYPosition;
    targetPosition: FlowPosition;
    center: Partial<XYPosition>;
    offset: number;
    samePositionEdges: FlowEdge[];
    currentEdgeIndex: number;
}): [XYPosition[], number, number, number, number] {
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
    let centerX, centerY;
    const [defaultCenterX, defaultCenterY, defaultOffsetX, defaultOffsetY] = getEdgeCenter({
        sourceX: source.x,
        sourceY: source.y,
        targetX: target.x,
        targetY: target.y
    });
    // opposite handle positions, default case
    if (sourceDir[dirAccessor] * targetDir[dirAccessor] === -1) {
        centerX = center.x || defaultCenterX;
        centerY = center.y || defaultCenterY;
        //    --->
        //    |
        // >---
        const verticalSplit: XYPosition[] = [
            { x: centerX, y: sourceGapped.y },
            { x: centerX, y: targetGapped.y }
        ];
        //    |
        //  ---
        //  |
        const horizontalSplit: XYPosition[] = [
            { x: sourceGapped.x, y: centerY },
            { x: targetGapped.x, y: centerY }
        ];
        if (sourceDir[dirAccessor] === currDir) {
            points = dirAccessor === 'x' ? verticalSplit : horizontalSplit;
        } else {
            points = dirAccessor === 'x' ? horizontalSplit : verticalSplit;
        }
        if (samePositionEdges.length > 1) {
            const { x, y } = getCenter(
                sourceGapped,
                targetGapped,
                dirAccessor,
                sourceDir,
                targetDir,
                currDir,
                false,
                samePositionEdges,
                currentEdgeIndex
            );
            centerX = x;
            centerY = y;
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
        let flipSourceTarget;
        if (sourcePosition !== targetPosition) {
            const dirAccessorOpposite = dirAccessor === 'x' ? 'y' : 'x';
            const isSameDir = sourceDir[dirAccessor] === targetDir[dirAccessorOpposite];
            const sourceGtTargetOppo = sourceGapped[dirAccessorOpposite] > targetGapped[dirAccessorOpposite];
            const sourceLtTargetOppo = sourceGapped[dirAccessorOpposite] < targetGapped[dirAccessorOpposite];
            flipSourceTarget =
                (sourceDir[dirAccessor] === 1 && ((!isSameDir && sourceGtTargetOppo) || (isSameDir && sourceLtTargetOppo))) ||
                (sourceDir[dirAccessor] !== 1 && ((!isSameDir && sourceLtTargetOppo) || (isSameDir && sourceGtTargetOppo)));

            if (flipSourceTarget) {
                points = dirAccessor === 'x' ? sourceTarget : targetSource;
            }
        }

        const { x, y } = getCenter(
            sourceGapped,
            targetGapped,
            dirAccessor,
            sourceDir,
            targetDir,
            currDir,
            flipSourceTarget,
            samePositionEdges,
            currentEdgeIndex
        );
        centerX = x;
        centerY = y;
    }

    const pathPoints = [source, sourceGapped, ...points, targetGapped, target];
    return [pathPoints, centerX, centerY, defaultOffsetX, defaultOffsetY];
}

const getCenter = (
    sourceGapped: XYPosition,
    targetGapped: XYPosition,
    dirAccessor: 'x' | 'y',
    sourceDir: XYPosition,
    targetDir: XYPosition,
    currDir: number,
    flipSourceTarget = false,
    samePositionEdges: FlowEdge[],
    currentEdgeIndex: number
): XYPosition => {
    let point, center;
    center = {
        x: Math.max(targetGapped.x, sourceGapped.x) - Math.abs(targetGapped.x - sourceGapped.x) / 2,
        y: Math.max(targetGapped.y, sourceGapped.y) - Math.abs(targetGapped.y - sourceGapped.y) / 2
    };
    if (samePositionEdges.length > 1) {
        point = {
            x:
                Math.max(targetGapped.x, sourceGapped.x) -
                (Math.abs(targetGapped.x - sourceGapped.x) -
                    currentEdgeIndex * (Math.abs(targetGapped.x - sourceGapped.x) / samePositionEdges.length)),
            y:
                Math.max(targetGapped.y, sourceGapped.y) -
                (Math.abs(targetGapped.y - sourceGapped.y) -
                    currentEdgeIndex * (Math.abs(targetGapped.x - sourceGapped.x) / samePositionEdges.length))
        };
    } else {
        point = { x: center.x, y: center.y };
    }
    const isOffsetXGreater = Math.abs(targetGapped.x - sourceGapped.x) > Math.abs(targetGapped.y - sourceGapped.y);
    const targetSource = isOffsetXGreater ? { x: point.x, y: sourceGapped.y } : { x: targetGapped.x, y: point.y };
    const sourceTarget = isOffsetXGreater ? { x: point.x, y: targetGapped.y } : { x: sourceGapped.x, y: point.y };

    let centerPoints;
    if (sourceDir[dirAccessor] * targetDir[dirAccessor] === -1) {
        if (sourceDir[dirAccessor] === currDir) {
            centerPoints = dirAccessor === 'x' ? { x: center.x, y: sourceGapped.y } : { x: center.x, y: targetGapped.y };
        } else {
            centerPoints = dirAccessor === 'x' ? { x: point.x, y: center.y } : { x: center.x, y: point.y };
        }
    } else {
        if (dirAccessor === 'x') {
            centerPoints = sourceDir.x === currDir ? targetSource : sourceTarget;
        } else {
            centerPoints = sourceDir.y === currDir ? sourceTarget : targetSource;
        }
        if (flipSourceTarget) {
            centerPoints = dirAccessor === 'x' ? sourceTarget : targetSource;
        }
    }
    return centerPoints;
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
