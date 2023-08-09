import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { PlaitBoard, PlaitPluginElementComponent, PlaitPluginElementContext, OnContextChanged } from '@plait/core';
import { RoughSVG } from 'roughjs/bin/svg';
import { Subject } from 'rxjs';
import { drawLine } from './utils/line';
import { PlaitBaseLine } from './interfaces';

@Component({
    selector: 'plait-draw-line',
    template: `
        <plait-children [board]="board" [parent]="element" [effect]="effect"></plait-children>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineComponent extends PlaitPluginElementComponent<PlaitBaseLine, PlaitBoard>
    implements OnInit, OnDestroy, OnContextChanged<PlaitBaseLine, PlaitBoard> {
    roughSVG!: RoughSVG;

    shapeG: SVGGElement | null = null;

    destroy$ = new Subject<void>();

    constructor(private viewContainerRef: ViewContainerRef, protected cdr: ChangeDetectorRef) {
        super(cdr);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.roughSVG = PlaitBoard.getRoughSVG(this.board);

        this.drawShape();
    }

    onContextChanged(
        value: PlaitPluginElementContext<PlaitBaseLine, PlaitBoard>,
        previous: PlaitPluginElementContext<PlaitBaseLine, PlaitBoard>
    ) {}

    drawShape() {
        this.destroyShape();
        this.shapeG = drawLine(this.board, this.element);
        this.g.prepend(this.shapeG);
    }

    destroyShape() {
        if (this.shapeG) {
            this.shapeG.remove();
            this.shapeG = null;
        }
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.destroy$.next();
        this.destroy$.complete();
    }
}
