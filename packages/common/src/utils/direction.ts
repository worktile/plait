import { Point, distanceBetweenPointAndPoint } from '@plait/core';

export enum Direction {
    left = 'left',
    top = 'top',
    right = 'right',
    bottom = 'bottom'
}

export type Vector = [number, number];

const handleDirectionFactors = {
    [Direction.left]: { x: -1, y: 0 },
    [Direction.right]: { x: 1, y: 0 },
    [Direction.top]: { x: 0, y: -1 },
    [Direction.bottom]: { x: 0, y: 1 }
};

export function getDirectionByPoint(point: Point, defaultDirection: Direction) {
    if (point[0] === 0) {
        return Direction.left;
    }
    if (point[0] === 1) {
        return Direction.right;
    }
    if (point[1] === 0) {
        return Direction.top;
    }
    if (point[1] === 1) {
        return Direction.bottom;
    }
    return defaultDirection;
}

/**
 * 这个函数接受两个参数，分别是向量的 x 分量和 y 分量。
 * 如果向量只有一个方向，函数会返回该方向的字符串，例如 'right'、'top'、'bottom' 或者 'left'。
 * 如果向量有两个方向，函数会返回更靠近哪个方向的字符串。
 */
export function getDirectionByVector(vector: Vector): Direction | null {
    const x = vector[0];
    const y = vector[1];
    if (x === 0 && y === 0) {
        return null;
    }
    if (x === 0) {
        return y > 0 ? Direction.bottom : Direction.top;
    }
    if (y === 0) {
        return x > 0 ? Direction.right : Direction.left;
    }
    const angle = Math.atan2(y, x);
    if (angle > -Math.PI / 4 && angle <= Math.PI / 4) {
        return Direction.right;
    } else if (angle > Math.PI / 4 && angle <= (3 * Math.PI) / 4) {
        return Direction.bottom;
    } else if (angle > (-3 * Math.PI) / 4 && angle <= -Math.PI / 4) {
        return Direction.top;
    } else {
        return Direction.left;
    }
}

export function rotateVector90(vector: Vector): Vector {
    const x = vector[0];
    const y = vector[1];
    const rotatedX = y;
    const rotatedY = -x;
    return [rotatedX, rotatedY];
}

export function getDirectionBetweenPointAndPoint(source: Point, target: Point) {
    if (source[0] === target[0]) {
        if (source[1] >= target[1]) {
            return Direction.top;
        } else {
            return Direction.bottom;
        }
    }
    if (source[1] === target[1]) {
        if (source[0] >= target[0]) {
            return Direction.left;
        } else {
            return Direction.right;
        }
    }
    throw new Error('can not match direction');
}

export function getDirectionFactor(direction: Direction) {
    return handleDirectionFactors[direction];
}

export function getFactorByPoints(source: Point, target: Point) {
    const distance = distanceBetweenPointAndPoint(...source, ...target);
    return {
        x: (target[0] - source[0]) / distance,
        y: (target[1] - source[1]) / distance
    };
}
