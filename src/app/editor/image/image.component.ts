import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { CommonImageItem, ImageBaseComponent } from '@plait/common';

@Component({
    selector: 'app-plait-image',
    template: `
        <img [src]="imageItem.url" draggable="false" [width]="imageItem.width" [height]="imageItem.height" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class PlaitImageComponent extends ImageBaseComponent implements OnInit {
    _imageItem!: CommonImageItem;

    set imageItem(value: CommonImageItem) {
        this._imageItem = value;
        this.cdr.markForCheck();
    }

    get imageItem() {
        return this._imageItem;
    }

    constructor(protected elementRef: ElementRef<HTMLElement>, public cdr: ChangeDetectorRef) {
        super();
    }

    nativeElement() {
        return this.elementRef.nativeElement;
    }

    ngOnInit(): void {
    }
}
