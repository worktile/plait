import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnInit } from '@angular/core';
import { MindImageBaseComponent } from '@plait/mind';

@Component({
    selector: 'mind-node-image',
    template: `
        <img [src]="imageItem.url" [width]="imageItem.width" [height]="imageItem.height" />
        <div *ngIf="isFocus" class="outline"></div>
    `,
    styles: [
        `
            .outline {
                position: absolute;
                top: 5px;
                right: 5px;
                bottom: 5px;
                left: 5px;
                border: 1px dashed #6698ff;
            }
        `
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MindImageComponent extends MindImageBaseComponent {
    constructor(protected elementRef: ElementRef<HTMLElement>, cdr: ChangeDetectorRef) {
        super(elementRef, cdr);
    }

    afterImageItemChange() {}
}
