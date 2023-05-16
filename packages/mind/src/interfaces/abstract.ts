import { PlaitBoard } from '@plait/core';
import { MindElement } from './element';
import { AbstractNode } from '@plait/layouts';

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

export type AbstractRefs = Map<MindElement, Pick<AbstractNode, 'start' | 'end'>>;
