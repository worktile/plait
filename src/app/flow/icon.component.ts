import { ChangeDetectionStrategy, Component, ElementRef, OnInit, inject } from '@angular/core';
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
    elementRef = inject(ElementRef<HTMLElement>);

    nativeElement(): HTMLElement {
        return this.elementRef.nativeElement;
    }

    ngOnInit(): void {
        super.initialize();
    }
}
