import { PlaitBoard, PlaitElement } from '@plait/core';

export abstract class ImageBaseComponent {
    _isFocus!: boolean;

    element!: PlaitElement;

    board!: PlaitBoard;

    set isFocus(value: boolean) {
        this._isFocus = value;
    }

    get isFocus() {
        return this._isFocus;
    }

    abstract nativeElement(): HTMLElement;
}
