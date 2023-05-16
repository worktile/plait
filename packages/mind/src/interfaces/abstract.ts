import { PlaitBoard } from '@plait/core';

export enum AbstractHandlePosition {
    start = 'start',
    end = 'end'
}

export enum AbstractResizeState {
    start = 'start',
    resizing = 'resizing',
    end = 'end'
}

export interface PlaitAbstractBoard extends PlaitBoard {
    abstractResize?: (state: AbstractResizeState) => void;
}

export interface AbstractIncludeAttribute {
    start: number;
    end: number;
}
