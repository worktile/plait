import { PlaitBoard, PlaitElement, Point, RectangleClient, ResizeCursorClass, setDragging } from '@plait/core';
import { ResizeHandle } from '../constants/resize';
import { PlaitElementOrArray, ResizeRef } from '../types/resize';

export const getResizeHandleByIndex = (index: number) => {
    return `${index}` as ResizeHandle;
};

export const getIndexByResizeHandle = (resizeHandle: ResizeHandle) => {
    return Number(resizeHandle);
};

export const getSymmetricHandleIndex = (board: PlaitBoard, index: number) => {
    const originIndex = isEdgeHandle(board, getResizeHandleByIndex(index)) ? index - 4 : index;
    let originSymmetricHandleIndex = originIndex + 2;
    if (originSymmetricHandleIndex >= 4) {
        originSymmetricHandleIndex = originSymmetricHandleIndex - 4;
    }
    return isEdgeHandle(board, getResizeHandleByIndex(index)) ? originSymmetricHandleIndex + 4 : originSymmetricHandleIndex;
};

const getResizeCursorClassByIndex = (index: number) => {
    switch (index) {
        case 0:
        case 2:
            return ResizeCursorClass.nwse;
        case 1:
        case 3:
            return ResizeCursorClass.nesw;
        case 4:
        case 6:
            return ResizeCursorClass.ns;
        case 5:
        case 7:
            return ResizeCursorClass.ew;
        default:
            return null;
    }
};

export const getRectangleResizeHandleRefs = (rectangle: RectangleClient, diameter: number) => {
    const corners = RectangleClient.getCornerPoints(rectangle);
    const refs = corners.map((corner, index: number) => {
        return {
            rectangle: {
                x: corner[0] - diameter / 2,
                y: corner[1] - diameter / 2,
                width: diameter,
                height: diameter
            },
            handle: getResizeHandleByIndex(index) as ResizeHandle,
            cursorClass: getResizeCursorClassByIndex(index) as ResizeCursorClass
        };
    });
    const rectangles = getResizeSideRectangles(corners, diameter / 2);
    refs.push(
        ...rectangles.map((rectangle, index) => {
            return {
                rectangle,
                handle: getResizeHandleByIndex(index + 4) as ResizeHandle,
                cursorClass: getResizeCursorClassByIndex(index + 4) as ResizeCursorClass
            };
        })
    );
    return refs;
};

export const getResizeHandlePointByIndex = (rectangle: RectangleClient, index: number) => {
    if (index <= 3) {
        const corners = RectangleClient.getCornerPoints(rectangle);
        return corners[index];
    } else {
        const edgeCenterPoints = RectangleClient.getEdgeCenterPoints(rectangle);
        return edgeCenterPoints[index - 4];
    }
};

const getResizeSideRectangles = (cornerPoints: Point[], offset: number): RectangleClient[] => {
    const result = [];
    for (let i = 0; i < cornerPoints.length; i++) {
        let rectangle = RectangleClient.getRectangleByPoints([cornerPoints[i], cornerPoints[(i + 1) % 4]]);
        const arr = new Array(2).fill(0);
        arr[(i + 1) % 2] = offset / 2;
        rectangle = RectangleClient.expand(rectangle, arr[0], arr[1]);
        result.push(rectangle);
    }
    return result;
};

export const IS_RESIZING = new WeakMap<PlaitBoard, ResizeRef<any, any>>();

export const isResizing = (board: PlaitBoard) => {
    return !!IS_RESIZING.get(board);
};

export const isResizingByCondition = <T extends PlaitElementOrArray, K>(board: PlaitBoard, match: (resizeRef: ResizeRef<T, K>) => boolean) => {
    return isResizing(board) && match(IS_RESIZING.get(board)!);
};

export const addResizing = <T extends PlaitElementOrArray, K>(board: PlaitBoard, resizeRef: ResizeRef<T, K>, key: string) => {
    PlaitBoard.getBoardContainer(board).classList.add(`${key}-resizing`);
    IS_RESIZING.set(board, resizeRef);
    setDragging(board, true);
};

export const removeResizing = (board: PlaitBoard, key: string) => {
    PlaitBoard.getBoardContainer(board).classList.remove(`${key}-resizing`);
    IS_RESIZING.delete(board);
    setDragging(board, false);
};

export const isEdgeHandle = (board: PlaitBoard, handle: ResizeHandle) => {
    const index = getIndexByResizeHandle(handle);
    if (index >= 4) {
        return true;
    } else {
        return false;
    }
};

export const isCornerHandle = (board: PlaitBoard, handle: ResizeHandle) => {
    return !isEdgeHandle(board, handle);
};
