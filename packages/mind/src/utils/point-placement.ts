import { Point, RectangleClient } from '@plait/core';
import { MindNode } from '../interfaces/node';
import { LayoutDirection } from '../interfaces/layout';
import { HorizontalPlacement, PointPlacement, VerticalPlacement } from '../interfaces/types';

export const getPointByPlacement = (client: RectangleClient, placement: PointPlacement): Point => {
    let x = client.x;
    let y = client.y;
    if (placement[0] === HorizontalPlacement.center) {
        x = client.x + client.width / 2;
    }
    if (placement[0] === HorizontalPlacement.right) {
        x = client.x + client.width;
    }
    if (placement[1] === VerticalPlacement.middle) {
        y = client.y + client.height / 2;
    }
    if (placement[1] === VerticalPlacement.bottom) {
        y = client.y + client.height;
    }
    return [x, y];
};

export interface PlacementRef {
    placement: PointPlacement;
    client: RectangleClient;
}

export const getXDistanceBetweenPoint = (point1: Point, point2: Point, isHorizontalLayout: boolean) => {
    if (isHorizontalLayout) {
        return Math.abs(point1[0] - point2[0]);
    } else {
        return Math.abs(point1[1] - point2[1]);
    }
};

export const getYDistanceBetweenPoint = (point1: Point, point2: Point, isHorizontalLayout: boolean) => {
    getXDistanceBetweenPoint(point1, point2, !isHorizontalLayout);
};

export const getLayoutDirection = (node: MindNode, isHorizontal: boolean) => {
    if (isHorizontal) {
        if (node.left) {
            return LayoutDirection.left;
        } else {
            return LayoutDirection.right;
        }
    } else {
        if (node.up) {
            return LayoutDirection.top;
        } else {
            return LayoutDirection.bottom;
        }
    }
};

// 以右为基准
// 右 -> 左:
// 1. 终点 -> 起点/起点 -> 终点
// 2. 加 -> 减

// 水平 -> 垂直:
// 1. 起点/终点 -> 纵轴
// 2. 加减 -> 纵轴

// 下 -> 上:
// 1. 终点 -> 起点/终点 -> 起点
// 2. 加 -> 减
export const moveXOfPoint = (point: Point, distance: number, direction: LayoutDirection = LayoutDirection.right): Point => {
    if (direction === LayoutDirection.left) {
        return [point[0] - distance, point[1]];
    }
    if (direction === LayoutDirection.bottom) {
        return [point[0], point[1] + distance];
    }
    if (direction === LayoutDirection.top) {
        return [point[0], point[1] - distance];
    }
    return [point[0] + distance, point[1]];
};

export const moveYOfPoint = (point: Point, distance: number, direction: LayoutDirection = LayoutDirection.right): Point => {
    if (direction === LayoutDirection.bottom) {
        return [point[0] + distance, point[1]];
    }
    if (direction === LayoutDirection.top) {
        return [point[0] + distance, point[1]];
    }
    return [point[0], point[1] + distance];
};

export const transformPlacement = (placement: PointPlacement, direction: LayoutDirection) => {
    // to left
    if (direction === LayoutDirection.left) {
        if (placement[0] === HorizontalPlacement.right) {
            placement[0] = HorizontalPlacement.left;
        } else if (placement[0] === HorizontalPlacement.left) {
            placement[0] = HorizontalPlacement.right;
        }
    }
    // to bottom
    if (direction === LayoutDirection.bottom || direction === LayoutDirection.top) {
        let horizontal = HorizontalPlacement.center;
        let vertical = VerticalPlacement.middle;
        if (placement[1] === VerticalPlacement.top) {
            horizontal = HorizontalPlacement.left;
        }
        if (placement[1] === VerticalPlacement.bottom) {
            horizontal = HorizontalPlacement.right;
        }
        if (placement[0] === HorizontalPlacement.left) {
            vertical = VerticalPlacement.top;
        }
        if (placement[0] === HorizontalPlacement.right) {
            vertical = VerticalPlacement.bottom;
        }
        placement[0] = horizontal;
        placement[1] = vertical;
    }
    // to up
    if (direction === LayoutDirection.top) {
        if (placement[1] === VerticalPlacement.bottom) {
            placement[1] = VerticalPlacement.top;
        } else if (placement[1] === VerticalPlacement.top) {
            placement[1] = VerticalPlacement.bottom;
        }
    }
};
