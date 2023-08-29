import { PlaitBoard, PlaitElement, Point, RectangleClient } from '@plait/core';
import { ResizeCursorClass, ResizeHandle } from '../constants/resize';

const getResizeHandleByIndex = (index: number) => {
    switch (index) {
        case 0:
            return ResizeHandle.nw;
        case 1:
            return ResizeHandle.ne;
        case 2:
            return ResizeHandle.se;
        case 3:
            return ResizeHandle.sw;
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

export const getRectangleResizeHandleRefs = (rectangle: RectangleClient, diameter: number) => {
    const centers = RectangleClient.getCornerPoints(rectangle);
    return centers.map((center, index: number) => {
        return {
            rectangle: {
                x: center[0] - diameter / 2,
                y: center[1] - diameter / 2,
                width: diameter,
                height: diameter
            },
            handle: getResizeHandleByIndex(index) as ResizeHandle,
            cursorClass: getResizeCursorClassByIndex(index) as ResizeCursorClass
        };
    });
};

export const IS_RESIZING = new WeakMap<PlaitBoard, PlaitElement>();

export const isResizing = (board: PlaitBoard) => {
    return !!IS_RESIZING.get(board);
};

export const isResizingByCondition = (board: PlaitBoard, match: (element: PlaitElement) => boolean) => {
    return isResizing(board) && match(IS_RESIZING.get(board) as PlaitElement);
};

export const addResizing = (board: PlaitBoard, element: PlaitElement, key: string) => {
    PlaitBoard.getBoardContainer(board).classList.add(`${key}-resizing`);
    IS_RESIZING.set(board, element);
};

export const removeResizing = (board: PlaitBoard, key: string) => {
    PlaitBoard.getBoardContainer(board).classList.remove(`${key}-resizing`);
    IS_RESIZING.delete(board);
};
