import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { ImageItem, ImageData } from '../interfaces/element-data';
import { PlaitBoard } from '@plait/core';
import { MindElement } from '../interfaces';

@Directive({
    host: {
        class: 'mind-node-image'
    }
})
export class MindImageBaseComponent implements OnInit {
    @Input()
    imageItem!: ImageItem;

    @Input()
    board!: PlaitBoard;

    @Input()
    element!: MindElement<ImageData>;

    get nativeElement() {
        return this.elementRef.nativeElement;
    }

    constructor(protected elementRef: ElementRef<HTMLElement>) {}

    ngOnInit(): void {}
}
