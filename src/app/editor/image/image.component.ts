import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { ImageBaseComponent } from '@plait/common';

@Component({
    selector: 'app-plait-image',
    template: `
        <img [src]="imageItem.url" draggable="false" [width]="imageItem.width" [height]="imageItem.height" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class PlaitImageComponent extends ImageBaseComponent implements OnInit {
    constructor(protected elementRef: ElementRef<HTMLElement>, public cdr: ChangeDetectorRef) {
        super();
    }

    nativeElement() {
        return this.elementRef.nativeElement;
    }

    ngOnInit(): void {
        super.initialize();
    }

    afterImageItemChange() {
        if (this.initialized) {
            this.cdr.detectChanges();
        }
    }
}
