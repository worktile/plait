import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, inject } from '@angular/core';
import { CommonImageItem, ImageBaseComponent } from '@plait/common';

@Component({
    selector: 'app-plait-image',
    template: ` <img [src]="imageItem.url" draggable="false" [width]="imageItem.width" [height]="imageItem.height" /> `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class PlaitImageComponent extends ImageBaseComponent {
    protected elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    cdr = inject(ChangeDetectorRef);

    _imageItem!: CommonImageItem;

    set imageItem(value: CommonImageItem) {
        this._imageItem = value;
        this.cdr.markForCheck();
    }

    get imageItem() {
        return this._imageItem;
    }

    constructor() {
        super();
    }

    nativeElement() {
        return this.elementRef.nativeElement;
    }
}
