import { ChangeDetectorRef, Directive, ElementRef, Input, OnInit } from '@angular/core';
import { ImageItem, ImageData } from '../interfaces/element-data';
import { PlaitBoard } from '@plait/core';
import { MindElement } from '../interfaces';

@Directive({
    host: {
        class: 'mind-node-image'
    }
})
export abstract class MindImageBaseComponent {
    _imageItem!: ImageItem;

    @Input() set imageItem(value: ImageItem) {
        this.afterImageItemChange(this._imageItem, value);
        this._imageItem = value;
    }

    get imageItem() {
        return this._imageItem;
    }

    @Input()
    board!: PlaitBoard;

    @Input()
    element!: MindElement<ImageData>;

    @Input()
    isFocus: boolean = false;

    get nativeElement() {
        return this.elementRef.nativeElement;
    }

    abstract afterImageItemChange(previous: ImageItem, current: ImageItem): void;

    constructor(protected elementRef: ElementRef<HTMLElement>, public cdr: ChangeDetectorRef) {}
}
