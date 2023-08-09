import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { PlaitBoard, PlaitPluginElementComponent, NODE_TO_INDEX, PlaitPluginElementContext, OnContextChanged } from '@plait/core';
import { RoughSVG } from 'roughjs/bin/svg';
import { Subject } from 'rxjs';
import { PlaitBaseGeometry, GeometryShape } from './interfaces/shape';
import { drawRectangle } from './utils/shape';

@Component({
    selector: 'plait-draw-geometry',
    template: `
        <plait-children [board]="board" [parent]="element" [effect]="effect"></plait-children>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeometryComponent extends PlaitPluginElementComponent<PlaitBaseGeometry, PlaitBoard>
    implements OnInit, OnDestroy, OnContextChanged<PlaitBaseGeometry, PlaitBoard> {
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
        value: PlaitPluginElementContext<PlaitBaseGeometry, PlaitBoard>,
        previous: PlaitPluginElementContext<PlaitBaseGeometry, PlaitBoard>
    ) {}

    drawShape() {
        this.destroyShape();

        const shape = this.element.shape;
        switch (shape) {
            case GeometryShape.rectangle:
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
