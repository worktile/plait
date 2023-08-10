import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { PlaitBoard, PlaitPluginElementComponent, PlaitPluginElementContext, OnContextChanged } from '@plait/core';
import { Subject } from 'rxjs';
import { PlaitGeometry } from './interfaces/geometry';
import { GeometryActiveGenerator } from './generator/geometry-active.generator';
import { GeometryShapeGenerator } from './generator/geometry-shape.generator';

@Component({
    selector: 'plait-draw-geometry',
    template: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeometryComponent extends PlaitPluginElementComponent<PlaitGeometry, PlaitBoard>
    implements OnInit, OnDestroy, OnContextChanged<PlaitGeometry, PlaitBoard> {
    destroy$ = new Subject<void>();

    activeGenerator!: GeometryActiveGenerator;

    shapeGenerator!: GeometryShapeGenerator;

    constructor(private viewContainerRef: ViewContainerRef, protected cdr: ChangeDetectorRef) {
        super(cdr);
    }

    initializeGenerator() {
        this.activeGenerator = new GeometryActiveGenerator(this.board);
        this.shapeGenerator = new GeometryShapeGenerator(this.board);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.initializeGenerator();
        this.shapeGenerator.draw(this.element, this.g);
    }

    onContextChanged(
        value: PlaitPluginElementContext<PlaitGeometry, PlaitBoard>,
        previous: PlaitPluginElementContext<PlaitGeometry, PlaitBoard>
    ) {
        if (value.element !== previous.element) {
            this.shapeGenerator.draw(this.element, this.g);
            this.activeGenerator.draw(this.element, this.g, { selected: this.selected });
        } else {
            const hasSameSelected = value.selected === previous.selected;
            if (!hasSameSelected) {
                this.activeGenerator.draw(this.element, this.g, { selected: this.selected });
            }
        }
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.destroy$.next();
        this.destroy$.complete();
    }
}
