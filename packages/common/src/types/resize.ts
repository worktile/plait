import { Path, PlaitElement, Point, RectangleClient, ResizeCursorClass } from '@plait/core';
import { ResizeHandle } from '../constants/resize';

export type PlaitElementOrArray = PlaitElement | PlaitElement[];

export interface WithResizeOptions<T extends PlaitElementOrArray = PlaitElementOrArray, K = ResizeHandle> {
    key: string;
    canResize: () => boolean;
    hitTest: (point: Point) => ResizeHitTestRef<T, K> | null;
    onResize: (resizeRef: ResizeRef<T, K>, resizeState: ResizeState) => void;
    afterResize?: (resizeRef: ResizeRef<T, K>) => void;
    beforeResize?: (resizeRef: ResizeRef<T, K>) => void;
}

export interface ResizeHitTestRef<T extends PlaitElementOrArray = PlaitElementOrArray, K = ResizeHandle> {
    element: T;
    rectangle?: RectangleClient;
    handle: K;
    handleIndex?: number;
    cursorClass?: ResizeCursorClass;
}

export interface ResizeState {
    startPoint: Point;
    endPoint: Point;
    isShift: boolean;
}

export interface ResizeRef<T extends PlaitElementOrArray = PlaitElementOrArray, K = ResizeHandle> {
    element: T;
    rectangle?: RectangleClient;
    path: Path | Path[];
    handle: K;
    handleIndex?: number;
}
