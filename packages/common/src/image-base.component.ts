import { ChangeDetectorRef, Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonImageItem } from './utils';
import { ActiveGenerator } from './generators';
import { PlaitBoard, PlaitElement, RectangleClient } from '@plait/core';

@Directive({
    host: {
        class: 'mind-node-image'
    }
})
export abstract class ImageBaseComponent implements OnInit, OnDestroy {
    _imageItem!: CommonImageItem;
    _isFocus!: boolean;
    initialized = false;

    activeGenerator!: ActiveGenerator;

    @Input()
    set imageItem(value: CommonImageItem) {
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

    abstract afterImageItemChange(previous: CommonImageItem, current: CommonImageItem): void;

    @Input() getRectangle!: () => RectangleClient;

    constructor(protected elementRef: ElementRef<HTMLElement>, public cdr: ChangeDetectorRef) {}

    ngOnInit(): void {
        this.activeGenerator = new ActiveGenerator(this.board, {
            getStrokeWidth: () => {
                return 1;
            },
            getStrokeOpacity: () => {
                return 1;
            },
            getRectangle: () => {
                return this.getRectangle();
            },
            hasResizeHandle: () => true
        });
        this.initialized = true;
    }

    drawFocus() {
        if (this.initialized) {
            const activeG = PlaitBoard.getElementActiveHost(this.board);
            this.activeGenerator.draw({} as PlaitElement, activeG, { selected: this._isFocus });
        }
    }

    ngOnDestroy(): void {
        if (this.activeGenerator) {
            this.activeGenerator.destroy();
        }
    }
}
