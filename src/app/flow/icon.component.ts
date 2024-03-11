import { ChangeDetectionStrategy, Component, ElementRef, OnInit } from '@angular/core';
import { FlowEdgeLabelIconBaseComponent } from '@plait/flow';

@Component({
    selector: 'flow-edge-label-icon',
    template: `
        {{ iconItem.name }}
    `,
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconComponent extends FlowEdgeLabelIconBaseComponent implements OnInit {
    constructor(protected elementRef: ElementRef<HTMLElement>) {
        super(elementRef);
    }

    ngOnInit(): void {
        super.ngOnInit();
    }
}
