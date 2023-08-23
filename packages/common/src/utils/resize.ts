import { PlaitBoard, Point, RectangleClient } from '@plait/core';
import { ResizeCursorClass, ResizeDirection } from '../constants/resize';

const getResizeDirectionByIndex = (index: number) => {
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

const getResizeCursorClassByIndex = (index: number) => {
    switch (index) {
        case 0:
            return ResizeCursorClass.nwse;
        case 1:
            return ResizeCursorClass.nesw;
        case 2:
            return ResizeCursorClass.nwse;
        case 3:
            return ResizeCursorClass.nesw;
        default:
            return null;
    }
};

export const getRectangleResizeTargets = (rectangle: RectangleClient, diameter: number) => {
    const centers = RectangleClient.getCornerPoints(rectangle);
    return centers.map((center, index: number) => {
        return {
            rectangle: {
                x: center[0] - diameter / 2,
                y: center[1] - diameter / 2,
                width: diameter,
                height: diameter
            },
            direction: getResizeDirectionByIndex(index) as ResizeDirection,
            cursorClass: getResizeCursorClassByIndex(index) as ResizeCursorClass
        };
    });
};

export const IS_RESIZING = new WeakMap<PlaitBoard, boolean>();

export const isResizing = (board: PlaitBoard) => {
    return !!IS_RESIZING.get(board);
};

export const addResizing = (board: PlaitBoard, key: string) => {
    PlaitBoard.getBoardContainer(board).classList.add(`${key}-resizing`);
    IS_RESIZING.set(board, true);
};

export const removeResizing = (board: PlaitBoard, key: string) => {
    PlaitBoard.getBoardContainer(board).classList.remove(`${key}-resizing`);
    IS_RESIZING.set(board, false);
};
