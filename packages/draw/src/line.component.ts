import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { PlaitBoard, PlaitPluginElementComponent, PlaitPluginElementContext, OnContextChanged } from '@plait/core';
import { Subject } from 'rxjs';
import { drawLine } from './utils/line';
import { PlaitLine } from './interfaces';

@Component({
    selector: 'plait-draw-line',
    template: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineComponent extends PlaitPluginElementComponent<PlaitLine, PlaitBoard>
    implements OnInit, OnDestroy, OnContextChanged<PlaitLine, PlaitBoard> {

    destroy$ = new Subject<void>();

    constructor(private viewContainerRef: ViewContainerRef, protected cdr: ChangeDetectorRef) {
        super(cdr);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.drawLine();
    }

    onContextChanged(
        value: PlaitPluginElementContext<PlaitLine, PlaitBoard>,
        previous: PlaitPluginElementContext<PlaitLine, PlaitBoard>
    ) {}

    drawLine() {
        this.g.prepend(drawLine(this.board, this.element));
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.destroy$.next();
        this.destroy$.complete();
    }
}
