import { Directive, ElementRef, Input } from '@angular/core';
import { EmojiItem } from '../../interfaces/element-data';
import { PlaitBoard } from '@plait/core';

@Directive()
export class MindEmojiBaseComponent {
    @Input()
    fontSize: number = 14;

    @Input()
    emojiItem!: EmojiItem;

    @Input()
    board!: PlaitBoard;

    get nativeElement() {
        return this.elementRef.nativeElement;
    }

    constructor(protected elementRef: ElementRef<HTMLElement>) {}
}
