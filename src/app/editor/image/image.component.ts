import { ChangeDetectionStrategy, Component, ElementRef, OnInit } from '@angular/core';
import { MindImageBaseComponent } from '@plait/mind';

@Component({
    selector: 'mind-node-image',
    template: `
        <img [src]="imageItem.url" [width]="imageItem.width" [height]="imageItem.height" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MindImageComponent extends MindImageBaseComponent implements OnInit {
    constructor(protected elementRef: ElementRef<HTMLElement>) {
        super(elementRef);
    }

    ngOnInit(): void {
        super.ngOnInit();
    }
}
