import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { PlaitBoard, PlaitPluginElementContext, OnContextChanged, isSelectionMoving, getSelectedElements } from '@plait/core';
import { Subject } from 'rxjs';
import { CommonPluginElement, ImageGenerator } from '@plait/common';
import { PlaitImage } from './interfaces/image';
import { LineAutoCompleteGenerator } from './generators/line-auto-complete.generator';

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

    lineAutoCompleteGenerator!: LineAutoCompleteGenerator;

    constructor() {
        super();
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
        this.lineAutoCompleteGenerator = new LineAutoCompleteGenerator(this.board);
        this.getRef().addGenerator(LineAutoCompleteGenerator.key, this.lineAutoCompleteGenerator);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.initializeGenerator();
        this.imageGenerator.processDrawing(this.element, this.getElementG(), this.viewContainerRef);
        this.lineAutoCompleteGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board), {
            selected: this.selected
        });
    }

    onContextChanged(
        value: PlaitPluginElementContext<PlaitImage, PlaitBoard>,
        previous: PlaitPluginElementContext<PlaitImage, PlaitBoard>
    ) {
        if (value.element !== previous.element) {
            this.imageGenerator.updateImage(this.getElementG(), previous.element, value.element);
            this.imageGenerator.componentRef.instance.isFocus = this.selected;
            this.lineAutoCompleteGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board), {
                selected: this.selected
            });
        } else {
            const hasSameSelected = value.selected === previous.selected;
            const hasSameHandleState = this.activeGenerator.options.hasResizeHandle() === this.activeGenerator.hasResizeHandle;
            if (!hasSameSelected || !hasSameHandleState) {
                this.imageGenerator.componentRef.instance.isFocus = this.selected;
                this.lineAutoCompleteGenerator.processDrawing(this.element, PlaitBoard.getElementActiveHost(this.board), {
                    selected: this.selected
                });
            }
        }
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.destroy$.next();
        this.destroy$.complete();
        this.imageGenerator.destroy();
        this.lineAutoCompleteGenerator.destroy();
    }
}
