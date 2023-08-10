import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { PlaitBoard, PlaitPluginElementComponent, PlaitPluginElementContext, OnContextChanged } from '@plait/core';
import { Subject } from 'rxjs';
import { PlaitGeometry } from './interfaces/geometry';
import { GeometryActiveDrawer } from './generator/geometry-active.generator';
import { GeometryShapeDrawer } from './generator/geometry-shape.generator';

@Component({
    selector: 'plait-draw-geometry',
    template: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeometryComponent extends PlaitPluginElementComponent<PlaitGeometry, PlaitBoard>
    implements OnInit, OnDestroy, OnContextChanged<PlaitGeometry, PlaitBoard> {
    destroy$ = new Subject<void>();

    activeDrawer!: GeometryActiveDrawer;

    shapeDrawer!: GeometryShapeDrawer;

    constructor(private viewContainerRef: ViewContainerRef, protected cdr: ChangeDetectorRef) {
        super(cdr);
    }

    initializeDrawer() {
        this.activeDrawer = new GeometryActiveDrawer(this.board);
        this.shapeDrawer = new GeometryShapeDrawer(this.board);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.initializeDrawer();
        this.shapeDrawer.draw(this.element, this.g);
    }

    onContextChanged(
        value: PlaitPluginElementContext<PlaitGeometry, PlaitBoard>,
        previous: PlaitPluginElementContext<PlaitGeometry, PlaitBoard>
    ) {
        if (value.element !== previous.element) {
            this.shapeDrawer.draw(this.element, this.g);
            this.activeDrawer.draw(this.element, this.g, { selected: this.selected });
        } else {
            const hasSameSelected = value.selected === previous.selected;
            if (!hasSameSelected) {
                this.activeDrawer.draw(this.element, this.g, { selected: this.selected });
            }
        }
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.destroy$.next();
        this.destroy$.complete();
    }
}
