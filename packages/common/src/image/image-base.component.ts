import { PlaitBoard, PlaitElement } from '@plait/core';
import { CommonImageItem } from '../utils';

export abstract class ImageBaseComponent {
    _imageItem!: CommonImageItem;

    _isFocus!: boolean;

    initialized = false;

    element!: PlaitElement;

    set imageItem(value: CommonImageItem) {
        this._imageItem = value;
        if (this.initialized) {
            this.afterImageItemChange(this._imageItem, value);
        }
    }

    get imageItem() {
        return this._imageItem;
    }

    board!: PlaitBoard;

    set isFocus(value: boolean) {
        this._isFocus = value;
    }

    get isFocus() {
        return this._isFocus;
    }

    abstract afterImageItemChange(previous: CommonImageItem, current: CommonImageItem): void;

    abstract nativeElement(): HTMLElement;

    initialize(): void {
        this.initialized = true;
    }

    destroy(): void {
    }
}
