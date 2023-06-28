import { ChangeDetectionStrategy, Component, ElementRef, OnInit } from '@angular/core';
import { FlowIconBaseComponent } from '@plait/flow';

@Component({
    selector: 'flow-edge-icon',
    template: `
        {{ iconItem.name }}
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconComponent extends FlowIconBaseComponent implements OnInit {
    constructor(protected elementRef: ElementRef<HTMLElement>) {
        super(elementRef);
    }

    ngOnInit(): void {
        super.ngOnInit();
    }
}
