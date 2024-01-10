import { Direction, Point, PointOfRectangle, Vector } from '@plait/core';
import { getUnitVectorByPointAndPoint } from './vector';

const handleDirectionFactors = {
    [Direction.left]: { x: -1, y: 0 },
    [Direction.right]: { x: 1, y: 0 },
    [Direction.top]: { x: 0, y: -1 },
    [Direction.bottom]: { x: 0, y: 1 }
};

export function getDirectionByPointOfRectangle(point: PointOfRectangle): Direction | undefined {
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
    return undefined;
}

/**
 * this function accepts vector parameter, the vector parameter vector is based on the screen coordinate system
 * vector[0] and vector[1] are the x and y components of the vector respectively.
 * if the vector has only one direction, the function returns a string in that direction, such as 'right', 'top', 'bottom' or 'left'.
 * if the vector has two directions, the function will return the string in which direction it is closer.
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
    if (Point.isEquals(source, target)) {
        return {
            x: 1,
            y: 1
        };
    }
    const unit = getUnitVectorByPointAndPoint(source, target);
    return {
        x: unit[0],
        y: unit[1]
    };
}
