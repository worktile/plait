import { Path, PlaitBoard, PlaitElement, Point, RectangleClient } from '@plait/core';
import { ResizeCursorClass, ResizeHandle } from '../constants/resize';

export interface ResizeRef<T extends PlaitElement = PlaitElement, K = ResizeHandle> {
    element: T;
    path: Path;
    handle: K;
}

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

export const IS_RESIZING = new WeakMap<PlaitBoard, ResizeRef<any, any>>();

export const isResizing = (board: PlaitBoard) => {
    return !!IS_RESIZING.get(board);
};

export const isResizingByCondition = <T extends PlaitElement, K>(board: PlaitBoard, match: (resizeRef: ResizeRef<T, K>) => boolean) => {
    return isResizing(board) && match(IS_RESIZING.get(board)!);
};

export const addResizing = <T extends PlaitElement, K>(board: PlaitBoard, resizeRef: ResizeRef<T, K>, key: string) => {
    PlaitBoard.getBoardContainer(board).classList.add(`${key}-resizing`);
    IS_RESIZING.set(board, resizeRef);
};

export const removeResizing = (board: PlaitBoard, key: string) => {
    PlaitBoard.getBoardContainer(board).classList.remove(`${key}-resizing`);
    IS_RESIZING.delete(board);
};
