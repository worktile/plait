import { ChangeDetectorRef, Directive, ElementRef, Input, OnInit } from '@angular/core';
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
export abstract class MindImageBaseComponent implements OnInit {
    _imageItem!: ImageItem;
    _isFocus!: boolean;

    activeGenerator!: ActiveGenerator<MindElement>;

    @Input()
    set imageItem(value: ImageItem) {
        this.afterImageItemChange(this._imageItem, value);
        this._imageItem = value;
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
        const com = PlaitElement.getComponent(this.element);
        this.activeGenerator.draw(this.element, com.g, { selected: this._isFocus });
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
            activeStrokeWidth: 1,
            getRectangle: (element: MindElement) => {
                return getImageForeignRectangle(this.board as PlaitMindBoard, this.element);
            },
            getStrokeWidthByElement: () => {
                return 0;
            }
        });
    }
}
