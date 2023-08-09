import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { PlaitBoard, PlaitPluginElementComponent, PlaitPluginElementContext, OnContextChanged } from '@plait/core';
import { RoughSVG } from 'roughjs/bin/svg';
import { Subject } from 'rxjs';
import { drawLine } from './utils/line';
import { PlaitBaseLine } from './interfaces';

@Component({
    selector: 'plait-draw-line',
    template: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineComponent extends PlaitPluginElementComponent<PlaitBaseLine, PlaitBoard>
    implements OnInit, OnDestroy, OnContextChanged<PlaitBaseLine, PlaitBoard> {

    destroy$ = new Subject<void>();

    constructor(private viewContainerRef: ViewContainerRef, protected cdr: ChangeDetectorRef) {
        super(cdr);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.drawLine();
    }

    onContextChanged(
        value: PlaitPluginElementContext<PlaitBaseLine, PlaitBoard>,
        previous: PlaitPluginElementContext<PlaitBaseLine, PlaitBoard>
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
