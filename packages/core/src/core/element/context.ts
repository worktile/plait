import { PlaitBoard, PlaitElement } from '../../interfaces';

export interface PlaitPluginElementContext<T extends PlaitElement = PlaitElement, K extends PlaitBoard = PlaitBoard> {
    element: T;
    parent: T | K;
    selected: boolean;
    board: K;
    index: number;
}

export interface PlaitChildrenContext<T extends PlaitElement = PlaitElement, K extends PlaitBoard = PlaitBoard> {
    board: K;
    parentG: SVGGElement;
    parent: T | K;
}
