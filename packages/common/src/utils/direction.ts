import { Point, distanceBetweenPointAndPoint } from '@plait/core';

export enum Direction {
    left = 'left',
    top = 'top',
    right = 'right',
    bottom = 'bottom'
}

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
