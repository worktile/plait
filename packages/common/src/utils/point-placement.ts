import { Direction, Point } from '@plait/core';

// Based on right
// Right -> Left:
// 1. End point -> starting point/start point -> end point
// 2. Add -> Subtract

// Horizontal -> Vertical:
// 1. Starting point/end point -> vertical axis
// 2. Addition and subtraction -> vertical axis

// Bottom -> Top:
// 1. End point -> starting point/end point -> starting point
// 2. Add -> Subtract
export const moveXOfPoint = (point: Point, distance: number, direction: Direction = Direction.right): Point => {
    if (direction === Direction.left) {
        return [point[0] - distance, point[1]];
    }
    if (direction === Direction.bottom) {
        return [point[0], point[1] + distance];
    }
    if (direction === Direction.top) {
        return [point[0], point[1] - distance];
    }
    return [point[0] + distance, point[1]];
};

export const moveYOfPoint = (point: Point, distance: number, direction: Direction = Direction.right): Point => {
    if (direction === Direction.bottom) {
        return [point[0] + distance, point[1]];
    }
    if (direction === Direction.top) {
        return [point[0] + distance, point[1]];
    }
    return [point[0], point[1] + distance];
};

export const getDirectionByIndex = (index: number) => {
    if (index === 0) {
        return Direction.top;
    }
    if (index === 1) {
        return Direction.right;
    }
    if (index === 2) {
        return Direction.bottom;
    }
    if (index === 3) {
        return Direction.left;
    }
    return Direction.right;
};

export const getXDistanceBetweenPoint = (point1: Point, point2: Point, isHorizontal: boolean) => {
    if (isHorizontal) {
        return Math.abs(point1[0] - point2[0]);
    } else {
        return Math.abs(point1[1] - point2[1]);
    }
};
