import { Point, Vector } from '@plait/core';

export function getUnitVectorByPointAndPoint(point1: Point, point2: Point): Point {
    const deltaX = point2[0] - point1[0];
    const deltaY = point2[1] - point1[1];
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    // Avoid division by zero if the points are the same
    if (distance === 0) {
        throw new Error('Points must not be the same for a unit vector calculation.');
    }
    // Calculate the unit vector components
    const unitX = deltaX / distance;
    const unitY = deltaY / distance;

    return [unitX, unitY];
}

export function getPointByVectorComponent(point: Point, vector: Vector, component: number): Point {
    const distance = Math.hypot(vector[0], vector[1]);
    return [point[0] + (vector[0] / distance) * component, point[1] + (vector[1] / distance) * component];
}

export function getPointByVectorDirectionComponent(point: Point, unitVector: Vector, directionComponent: number, isHorizontal: boolean) {
    if (isHorizontal) {
        return [point[0] + directionComponent, point[1] + (directionComponent / unitVector[0]) * unitVector[1]] as Point;
    } else {
        return [point[0] + (directionComponent / unitVector[1]) * unitVector[0], point[1] + directionComponent] as Point;
    }
}

export function rotateVectorAnti90(vector: Vector): Vector {
    const x = vector[0];
    const y = vector[1];
    const rotatedX = y;
    const rotatedY = -x;
    return [rotatedX, rotatedY];
}

export function rotateVector(vector: Vector, angle: number): Vector {
    if (!angle) {
        return vector;
    }
    const x = vector[0];
    const y = vector[1];
    const rotatedX = x * Math.cos(angle) - y * Math.sin(angle);
    const rotatedY = x * Math.sin(angle) + y * Math.cos(angle);
    return [rotatedX, rotatedY];
}
