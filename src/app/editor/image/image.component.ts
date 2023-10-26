import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnInit } from '@angular/core';
import { ImageBaseComponent } from '@plait/common';
import { MindImageBaseComponent } from '@plait/mind';

@Component({
    selector: 'app-mind-node-image',
    template: `
        <img [src]="imageItem.url" [width]="imageItem.width" [height]="imageItem.height" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class MindImageComponent extends ImageBaseComponent {
    constructor(protected elementRef: ElementRef<HTMLElement>, cdr: ChangeDetectorRef) {
        super(elementRef, cdr);
    }

    afterImageItemChange() {}
}
