import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { PlaitBoard, PlaitPluginElementComponent, NODE_TO_INDEX, PlaitPluginElementContext, OnContextChanged } from '@plait/core';
import { RoughSVG } from 'roughjs/bin/svg';
import { Subject } from 'rxjs';
import { PlaitBaseShape, GeoType } from './interfaces/shape';
import { drawRectangle } from './utils/shape';

@Component({
    selector: 'plait-draw-element',
    template: `
        <plait-children [board]="board" [parent]="element" [effect]="effect"></plait-children>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeoComponent extends PlaitPluginElementComponent<PlaitBaseShape, PlaitBoard>
    implements OnInit, OnDestroy, OnContextChanged<PlaitBaseShape, PlaitBoard> {
    roughSVG!: RoughSVG;

    index!: number;

    shapeG: SVGGElement | null = null;

    linkG?: SVGGElement;

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
        value: PlaitPluginElementContext<PlaitBaseShape, PlaitBoard>,
        previous: PlaitPluginElementContext<PlaitBaseShape, PlaitBoard>
    ) {}

    drawShape() {
        this.destroyShape();

        const shape = this.element.shape;
        switch (shape) {
            case GeoType.rectangle:
                this.shapeG = drawRectangle(this.board, this.element);
                this.g.prepend(this.shapeG);
                break;
            default:
                break;
        }
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
