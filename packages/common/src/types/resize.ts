import { Path, PlaitElement, Point, RectangleClient, ResizeCursorClass } from '@plait/core';
import { ResizeHandle } from '../constants/resize';

export type PlaitElementOrArray = PlaitElement | PlaitElement[];

export interface ResizeOptions {}

export interface WithResizeOptions<T extends PlaitElementOrArray = PlaitElementOrArray, K = ResizeHandle, P = ResizeOptions> {
    key: string;
    canResize: () => boolean;
    hitTest: (point: Point) => ResizeHitTestRef<T, K, P> | null;
    onResize: (resizeRef: ResizeRef<T, K, P>, resizeState: ResizeState) => void;
    afterResize?: (resizeRef: ResizeRef<T, K, P>) => void;
    beforeResize?: (resizeRef: ResizeRef<T, K, P>) => void;
}

export interface ResizeHitTestRef<T extends PlaitElementOrArray = PlaitElementOrArray, K = ResizeHandle, P = ResizeOptions> {
    element: T;
    rectangle?: RectangleClient;
    handle: K;
    handleIndex?: number;
    cursorClass?: ResizeCursorClass;
    options?: P;
}

export interface ResizeState {
    startPoint: Point;
    endPoint: Point;
    isShift: boolean;
}

export interface ResizeRef<T extends PlaitElementOrArray = PlaitElementOrArray, K = ResizeHandle, P = ResizeOptions> {
    element: T;
    rectangle?: RectangleClient;
    path: Path | Path[];
    handle: K;
    handleIndex?: number;
    options?: P;
}
