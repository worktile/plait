import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { PlaitBoard, PlaitPluginElementComponent, PlaitPluginElementContext, OnContextChanged } from '@plait/core';
import { Subject } from 'rxjs';
import { PlaitLine } from './interfaces';
import { TextManage } from '@plait/text';
import { LineShapeGenerator } from './generator/line.generator';
import { LineActiveGenerator } from './generator/line-active.generator';

@Component({
    selector: 'plait-draw-line',
    template: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineComponent extends PlaitPluginElementComponent<PlaitLine, PlaitBoard>
    implements OnInit, OnDestroy, OnContextChanged<PlaitLine, PlaitBoard> {
    destroy$ = new Subject<void>();

    shapeGenerator!: LineShapeGenerator;

    activeGenerator!: LineActiveGenerator;

    textManage!: TextManage;

    constructor(private viewContainerRef: ViewContainerRef, protected cdr: ChangeDetectorRef) {
        super(cdr);
    }
    initializeGenerator() {
        this.shapeGenerator = new LineShapeGenerator(this.board);
        this.activeGenerator = new LineActiveGenerator(this.board);
    }

    ngOnInit(): void {
        this.initializeGenerator();
        this.shapeGenerator.draw(this.element, this.g);
        this.activeGenerator.draw(this.element, this.g, { selected: this.selected });
        super.ngOnInit();
    }

    onContextChanged(value: PlaitPluginElementContext<PlaitLine, PlaitBoard>, previous: PlaitPluginElementContext<PlaitLine, PlaitBoard>) {
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
