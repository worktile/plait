import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    NgZone,
    OnDestroy,
    OnInit,
    Renderer2,
    ViewContainerRef
} from '@angular/core';
import { FlowBaseComponent } from './flow-base.component';

@Component({
    selector: 'plait-flow-edge',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlowEdgeComponent extends FlowBaseComponent implements OnInit, OnDestroy {
    constructor(
        public viewContainerRef: ViewContainerRef,
        public render2: Renderer2,
        public cdr: ChangeDetectorRef,
        public elementRef: ElementRef,
        public zone: NgZone
    ) {
        super(viewContainerRef, render2, cdr, elementRef, zone);
    }

    ngOnInit(): void {
        super.ngOnInit();
    }

    updateWorkflow() {
        super.updateWorkflow();
    }

    drawActiveG() {
        super.drawActiveG();
    }

    destroyActiveG() {
        super.destroyActiveG();
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
