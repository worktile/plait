// Credits to xyflow
// https://github.com/xyflow/xyflow/blob/main/packages/system/src/utils/edges/smoothstep-edge.ts

import { Direction, Point } from "@plait/core";
import { getDirectionFactor } from "./direction";

export const getPoints = (source: Point, sourcePosition: Direction, target: Point, targetPosition: Direction, offset: number) => {
    const sourceDirectionFactors = getDirectionFactor(sourcePosition);
    const targetDFs = getDirectionFactor(targetPosition);
    const sourceGapped: Point = [source[0] + sourceDirectionFactors.x * offset, source[1] + sourceDirectionFactors.y * offset];
    const targetGapped: Point = [target[0] + targetDFs.x * offset, target[1] + targetDFs.y * offset];
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
    if (sourceDirectionFactors[dirAccessor] * targetDFs[dirAccessor] === -1) {
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
        if (sourceDirectionFactors[dirAccessor] === currDir) {
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
            points = sourceDirectionFactors.x === currDir ? targetSource : sourceTarget;
        } else {
            points = sourceDirectionFactors.y === currDir ? sourceTarget : targetSource;
        }

        // these are conditions for handling mixed handle positions like right -> bottom for example
        let flipSourceTarget;
        if (sourcePosition !== targetPosition) {
            const dirAccessorOpposite = dirAccessor === 'x' ? 1 : 0;
            const isSameDir = sourceDirectionFactors[dirAccessor] === targetDFs[dirAccessor === 'x' ? 'y' : 'x'];
            const sourceGtTarget = sourceGapped[dirAccessorOpposite] > targetGapped[dirAccessorOpposite];
            const sourceLtTarget = sourceGapped[dirAccessorOpposite] < targetGapped[dirAccessorOpposite];
            flipSourceTarget =
                (sourceDirectionFactors[dirAccessor] === 1 && ((!isSameDir && sourceGtTarget) || (isSameDir && sourceLtTarget))) ||
                (sourceDirectionFactors[dirAccessor] !== 1 && ((!isSameDir && sourceLtTarget) || (isSameDir && sourceGtTarget)));

            if (flipSourceTarget) {
                points = dirAccessor === 'x' ? sourceTarget : targetSource;
            }
        }
    }
    return [source, sourceGapped, ...points, targetGapped, target];
};

const getDirection = (source: Point, sourcePosition = Direction.bottom, target: Point) => {
    if (sourcePosition === Direction.left || sourcePosition === Direction.right) {
        return source[0] < target[0] ? { x: 1, y: 0 } : { x: -1, y: 0 };
    }
    return source[1] < target[1] ? { x: 0, y: 1 } : { x: 0, y: -1 };
};

function getEdgeCenter({
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