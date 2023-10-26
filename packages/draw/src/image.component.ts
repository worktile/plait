import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { PlaitBoard, PlaitPluginElementContext, OnContextChanged, isSelectionMoving, getSelectedElements } from '@plait/core';
import { Subject } from 'rxjs';
import { CommonPluginElement, ImageGenerator } from '@plait/common';
import { PlaitImage } from './interfaces/image';

@Component({
    selector: 'plait-draw-geometry',
    template: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class ImageComponent extends CommonPluginElement<PlaitImage, PlaitBoard>
    implements OnInit, OnDestroy, OnContextChanged<PlaitImage, PlaitBoard> {
    destroy$ = new Subject<void>();

    get activeGenerator() {
        return this.imageGenerator.componentRef.instance.activeGenerator;
    }

    imageGenerator!: ImageGenerator<PlaitImage>;

    constructor(private viewContainerRef: ViewContainerRef, protected cdr: ChangeDetectorRef) {
        super(cdr);
    }

    initializeGenerator() {
        this.imageGenerator = new ImageGenerator<PlaitImage>(this.board, {
            getRectangle: (element: PlaitImage) => {
                return {
                    x: element.points[0][0],
                    y: element.points[0][1],
                    width: element.points[1][0] - element.points[0][0],
                    height: element.points[1][1] - element.points[0][1]
                };
            },
            getImageItem: element => {
                return {
                    url: element.url,
                    width: element.points[1][0] - element.points[0][0],
                    height: element.points[1][1] - element.points[0][1]
                };
            }
        });
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.initializeGenerator();
        this.imageGenerator.draw(this.element, this.g, this.viewContainerRef);
    }

    onContextChanged(
        value: PlaitPluginElementContext<PlaitImage, PlaitBoard>,
        previous: PlaitPluginElementContext<PlaitImage, PlaitBoard>
    ) {
        if (value.element !== previous.element) {
            this.imageGenerator.updateImage(this.g, previous.element, value.element);
            this.imageGenerator.componentRef.instance.isFocus = this.selected;
        } else {
            const hasSameSelected = value.selected === previous.selected;
            const hasSameHandleState = this.activeGenerator.options.hasResizeHandle() === this.activeGenerator.hasResizeHandle;
            if (!hasSameSelected || !hasSameHandleState) {
                this.imageGenerator.componentRef.instance.isFocus = this.selected;
            }
        }
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.destroy$.next();
        this.destroy$.complete();
        this.imageGenerator.destroy();
    }
}
