import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { PlaitBoard, PlaitPluginElementContext, OnContextChanged, isSelectionMoving, getSelectedElements } from '@plait/core';
import { Subject } from 'rxjs';
import { ActiveGenerator, getRectangleByPoints, CommonPluginElement } from '@plait/common';
import { PlaitImage } from './interfaces/image';
import { ImageGenerator } from './generators/image.generator';

@Component({
    selector: 'plait-draw-geometry',
    template: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class ImageComponent extends CommonPluginElement<PlaitImage, PlaitBoard>
    implements OnInit, OnDestroy, OnContextChanged<PlaitImage, PlaitBoard> {
    destroy$ = new Subject<void>();

    activeGenerator!: ActiveGenerator<PlaitImage>;

    imageGenerator!: ImageGenerator;

    constructor(private viewContainerRef: ViewContainerRef, protected cdr: ChangeDetectorRef) {
        super(cdr);
    }

    initializeGenerator() {
        this.activeGenerator = new ActiveGenerator<PlaitImage>(this.board, {
            getStrokeWidth: () => {
                return 1;
            },
            getStrokeOpacity: () => {
                return 1;
            },
            getRectangle: (element: PlaitImage) => {
                return getRectangleByPoints(element.points);
            },
            hasResizeHandle: () => {
                const selectedElements = getSelectedElements(this.board);
                return selectedElements.length === 1 && !isSelectionMoving(this.board);
            }
        });
        this.imageGenerator = new ImageGenerator(this.board);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.initializeGenerator();
        this.imageGenerator.draw(this.element, this.g, this.viewContainerRef);
        this.activeGenerator.draw(this.element, this.g, { selected: this.selected });
    }

    onContextChanged(
        value: PlaitPluginElementContext<PlaitImage, PlaitBoard>,
        previous: PlaitPluginElementContext<PlaitImage, PlaitBoard>
    ) {
        if (value.element !== previous.element) {
            this.imageGenerator.draw(this.element, this.g, this.viewContainerRef);
            this.activeGenerator.draw(this.element, this.g, { selected: this.selected });
        } else {
            const hasSameSelected = value.selected === previous.selected;
            const hasSameHandleState = this.activeGenerator.options.hasResizeHandle() === this.activeGenerator.hasResizeHandle;
            if (!hasSameSelected || !hasSameHandleState) {
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
