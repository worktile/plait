import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { PlaitBoard } from '@plait/core';
import { LabelIconItem } from '../interfaces/icon';
import { FlowElement } from '../interfaces/element';
import { EDGE_LABEL_FONTSIZE } from '../constants/edge';

@Directive({
    host: {
        class: 'flow-edge-label-icon'
    }
})
export class FlowEdgeLabelIconBaseComponent implements OnInit {
    @Input()
    fontSize: number = EDGE_LABEL_FONTSIZE;

    @Input()
    iconItem!: LabelIconItem;

    @Input()
    board!: PlaitBoard;

    @Input()
    element!: FlowElement;

    get nativeElement() {
        return this.elementRef.nativeElement;
    }

    constructor(protected elementRef: ElementRef<HTMLElement>) {}

    ngOnInit(): void {
        this.elementRef.nativeElement.style.fontSize = `${this.fontSize}px`;
    }
}
