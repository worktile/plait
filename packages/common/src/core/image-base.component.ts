import { ChangeDetectorRef, Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { ACTIVE_STROKE_WIDTH, PlaitBoard, PlaitElement, RectangleClient, getSelectedElements, isSelectionMoving } from '@plait/core';
import { ActiveGenerator } from '../generators';
import { CommonImageItem } from '../utils';

@Directive({
    host: {
        class: 'plait-image-container'
    }
})
export abstract class ImageBaseComponent implements OnInit, OnDestroy {
    _imageItem!: CommonImageItem;

    _isFocus!: boolean;

    initialized = false;

    activeGenerator!: ActiveGenerator;

    @Input()
    element!: PlaitElement;

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

    @Input() hasResizeHandle!: () => boolean;

    constructor(protected elementRef: ElementRef<HTMLElement>, public cdr: ChangeDetectorRef) {}

    ngOnInit(): void {
        this.activeGenerator = new ActiveGenerator(this.board, {
            getStrokeWidth: () => {
                const selectedElements = getSelectedElements(this.board);
                if (!(selectedElements.length === 1 && !isSelectionMoving(this.board))) {
                    return ACTIVE_STROKE_WIDTH;
                } else {
                    return ACTIVE_STROKE_WIDTH;
                }
            },
            getStrokeOpacity: () => {
                const selectedElements = getSelectedElements(this.board);
                if ((selectedElements.length === 1 && !isSelectionMoving(this.board)) || !selectedElements.length) {
                    return 1;
                } else {
                    return 0.5;
                }
            },
            getRectangle: () => {
                return this.getRectangle();
            },
            hasResizeHandle: () => {
                const selectedElements = getSelectedElements(this.board);
                return (selectedElements.length === 1 && !isSelectionMoving(this.board)) || !selectedElements.length;
            }
        });
        this.initialized = true;
    }

    drawFocus() {
        if (this.initialized) {
            const activeG = PlaitBoard.getElementActiveHost(this.board);
            this.activeGenerator.processDrawing(this.element as PlaitElement, activeG, { selected: this._isFocus });
        }
    }

    ngOnDestroy(): void {
        if (this.activeGenerator) {
            this.activeGenerator.destroy();
        }
    }
}
