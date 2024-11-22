import { ElementFlavour, PlaitBoard, PlaitElement } from '@plait/core';
import { PlaitCommonElementRef } from './element-ref';

export class CommonElementFlavour<
    T extends PlaitElement = PlaitElement,
    K extends PlaitBoard = PlaitBoard,
    R extends PlaitCommonElementRef = PlaitCommonElementRef
> extends ElementFlavour<T, K, R> {
    constructor(elementRef = new PlaitCommonElementRef()) {
        super(elementRef as R);
    }
}
