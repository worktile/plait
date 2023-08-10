import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { PlaitBoard, PlaitPluginElementComponent, PlaitPluginElementContext, OnContextChanged } from '@plait/core';
import { Subject } from 'rxjs';
import { PlaitBaseGeometry, GeometryShape } from './interfaces/geometry';
import { drawRectangle } from './utils/geometry';

@Component({
    selector: 'plait-draw-geometry',
    template: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeometryComponent extends PlaitPluginElementComponent<PlaitBaseGeometry, PlaitBoard>
    implements OnInit, OnDestroy, OnContextChanged<PlaitBaseGeometry, PlaitBoard> {
    destroy$ = new Subject<void>();

    constructor(private viewContainerRef: ViewContainerRef, protected cdr: ChangeDetectorRef) {
        super(cdr);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.drawGeometry();
    }

    onContextChanged(
        value: PlaitPluginElementContext<PlaitBaseGeometry, PlaitBoard>,
        previous: PlaitPluginElementContext<PlaitBaseGeometry, PlaitBoard>
    ) {}

    drawGeometry() {
        const shape = this.element.shape;
        switch (shape) {
            case GeometryShape.rectangle:
                this.g.prepend(drawRectangle(this.board, this.element));
                break;
            default:
                break;
        }
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.destroy$.next();
        this.destroy$.complete();
    }
}
