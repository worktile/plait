import { Point, RectangleClient } from '@plait/core';
import { ResizeCursorDirection, ResizeDirection } from '../constants/resize';

/**
 * @returns [left-top,right-top,right-bottom,left-bottom]: [Point, Point, Point, Point]
 */
export const getHandleCenters = (rectangle: RectangleClient) => {
    return [
        [rectangle.x, rectangle.y],
        [rectangle.x + rectangle.width, rectangle.y],
        [rectangle.x + rectangle.width, rectangle.y + rectangle.height],
        [rectangle.x, rectangle.y + rectangle.height]
    ] as [Point, Point, Point, Point];
};

const getDirectionByIndex = (index: number) => {
    switch (index) {
        case 0:
            return ResizeDirection.nw;
        case 1:
            return ResizeDirection.ne;
        case 2:
            return ResizeDirection.se;
        case 3:
            return ResizeDirection.sw;
        default:
            return null;
    }
};

const getCursorDirectionByIndex = (index: number) => {
    switch (index) {
        case 0:
            return ResizeCursorDirection.nwse;
        case 1:
            return ResizeCursorDirection.nesw;
        case 2:
            return ResizeCursorDirection.nwse;
        case 3:
            return ResizeCursorDirection.nesw;
        default:
            return null;
    }
};

export const getRectangleResizeTargets = (rectangle: RectangleClient, diameter: number) => {
    const centers = getHandleCenters(rectangle);
    return centers.map((center, index: number) => {
        return {
            rectangle: {
                x: center[0] - diameter / 2,
                y: center[1] - diameter / 2,
                width: diameter,
                height: diameter
            },
            direction: getDirectionByIndex(index) as ResizeDirection,
            cursorDirection: getCursorDirectionByIndex(index) as ResizeCursorDirection
        };
    });
};
