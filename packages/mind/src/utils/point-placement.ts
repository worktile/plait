import { Point, RectangleClient } from '@plait/core';
import { MindNode } from '../interfaces/node';
import { LayoutDirection } from '../interfaces/layout';
import { HorizontalPlacement, PointPlacement, VerticalPlacement } from '../interfaces/types';
import { getXDistanceBetweenPoint } from '@plait/common';

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
