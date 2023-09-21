import { ChangeDetectorRef, Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { ImageItem, ImageData } from '../interfaces/element-data';
import { PlaitBoard, PlaitElement } from '@plait/core';
import { MindElement } from '../interfaces';
import { ActiveGenerator } from '@plait/common';
import { getImageForeignRectangle } from '../utils/position/image';
import { PlaitMindBoard } from '../plugins/with-mind.board';

@Directive({
    host: {
        class: 'mind-node-image'
    }
})
export abstract class MindImageBaseComponent implements OnInit, OnDestroy {
    _imageItem!: ImageItem;
    _isFocus!: boolean;
    initialized = false;

    activeGenerator!: ActiveGenerator<MindElement>;

    @Input()
    set imageItem(value: ImageItem) {
        this.afterImageItemChange(this._imageItem, value);
        this._imageItem = value;
        this.drawFocus();
    }

    get imageItem() {
        return this._imageItem;
    }

    @Input()
    board!: PlaitBoard;

    @Input()
    element!: MindElement<ImageData>;

    @Input()
    set isFocus(value: boolean) {
        this._isFocus = value;
        this.drawFocus();
    }

    get isFocus() {
        return this._isFocus;
    }

    get nativeElement() {
        return this.elementRef.nativeElement;
    }

    abstract afterImageItemChange(previous: ImageItem, current: ImageItem): void;

    constructor(protected elementRef: ElementRef<HTMLElement>, public cdr: ChangeDetectorRef) {}

    ngOnInit(): void {
        this.activeGenerator = new ActiveGenerator<MindElement>(this.board, {
            getStrokeWidth: () => {
                return 1;
            },
            getRectangle: (element: MindElement) => {
                return getImageForeignRectangle(this.board as PlaitMindBoard, this.element);
            },
            // getStrokeWidthByElement: () => {
            //     return 0;
            // },
            hasResizeHandle: () => true
        });
        this.initialized = true;
    }

    drawFocus() {
        if (this.initialized) {
            const com = PlaitElement.getComponent(this.element);
            this.activeGenerator.draw(this.element, com.g, { selected: this._isFocus });
        }
    }

    ngOnDestroy(): void {
        if (this.activeGenerator) {
            this.activeGenerator.destroy();
        }
    }
}
