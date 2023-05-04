import { Directive, ElementRef, Input } from '@angular/core';
import { EmojiItem } from '../../interfaces/element-data';

@Directive()
export class MindEmojiBaseComponent {
    @Input()
    fontSize: number = 14;

    @Input()
    emojiItem!: EmojiItem;

    get nativeElement() {
        return this.elementRef.nativeElement;
    }

    constructor(protected elementRef: ElementRef<HTMLElement>) {}
}
