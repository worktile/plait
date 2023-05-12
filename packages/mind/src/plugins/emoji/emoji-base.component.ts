import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { EmojiItem } from '../../interfaces/element-data';
import { PlaitBoard } from '@plait/core';
import { MindElement } from '../../interfaces';
import { EmojiData } from '@plait/mind';

@Directive({
    host: {
        class: 'mind-node-emoji'
    }
})
export class MindEmojiBaseComponent implements OnInit {
    @Input()
    fontSize: number = 14;

    @Input()
    emojiItem!: EmojiItem;

    @Input()
    board!: PlaitBoard;

    @Input()
    element!: MindElement<EmojiData>;

    get nativeElement() {
        return this.elementRef.nativeElement;
    }

    constructor(protected elementRef: ElementRef<HTMLElement>) {}

    ngOnInit(): void {
        this.elementRef.nativeElement.style.fontSize = `${this.fontSize}px`;
    }
}
