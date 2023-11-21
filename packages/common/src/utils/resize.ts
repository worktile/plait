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
        case 4:
            return ResizeHandle.n;
        case 5:
            return ResizeHandle.e;
        case 6:
            return ResizeHandle.s;
        case 7:
            return ResizeHandle.w;
        default:
            return null;
    }
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

const getResizeSideRectangles = (cornerPoints: Point[], offset: number): RectangleClient[] => {
    const result = [];
    for (let i = 0; i < cornerPoints.length; i++) {
        let rectangle = RectangleClient.toRectangleClient([cornerPoints[i], cornerPoints[(i + 1) % 4]]);
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
