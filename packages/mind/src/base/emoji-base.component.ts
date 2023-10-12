import { Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { EmojiData, EmojiItem } from '../interfaces/element-data';
import { PlaitBoard, PlaitOptionsBoard, PlaitPluginKey, WithPluginOptions } from '@plait/core';
import { MindElement } from '../interfaces';

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

    @HostListener('pointerdown')
    handlePointerDown() {
        const currentOptions = (this.board as PlaitOptionsBoard).getPluginOptions(PlaitPluginKey.withSelection);
        (this.board as PlaitOptionsBoard).setPluginOptions<WithPluginOptions>(PlaitPluginKey.withSelection, {
            isDisabledSelect: true
        });
        setTimeout(() => {
            (this.board as PlaitOptionsBoard).setPluginOptions<WithPluginOptions>(PlaitPluginKey.withSelection, { ...currentOptions });
        }, 0);
    }

    constructor(protected elementRef: ElementRef<HTMLElement>) {}

    ngOnInit(): void {
        this.elementRef.nativeElement.style.fontSize = `${this.fontSize}px`;
    }
}
