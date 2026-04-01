import { Component, ElementRef, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PlaitBoard, toViewBoxPoint, toHostPoint } from '@plait/core';

/* eslint-disable @angular-eslint/component-selector */
@Component({
    selector: 'debug-point-display',
    template: ``,
    imports: [],
    host: {
        style: 'position: absolute;top:0;left:0;'
    }
})
export class DebugPointDisplayComponent implements OnChanges {
    @Input()
    board?: PlaitBoard;

    elementRef: ElementRef<HTMLElement> = inject(ElementRef<HTMLElement>);

    constructor() {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['board'] && this.board) {
            const board = this.board as PlaitBoard;
            const { pointerMove } = board;
            board.pointerMove = (e) => {
                pointerMove(e);
                const point = toViewBoxPoint(board, toHostPoint(board, e.x, e.y));
                this.elementRef.nativeElement.innerHTML = `${point[0]},${point[1]}`;
            };
        }
    }
}
