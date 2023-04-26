import { ChangeDetectionStrategy, Component, ElementRef, Input, OnInit } from "@angular/core";
import { EmojiItem } from "../../interfaces";

@Component({
    selector: 'mind-emoji',
    template: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MindEmojiComponent implements OnInit {
    @Input()
    fontSize: number = 14;

    @Input()
    emojiItem!: EmojiItem;

    get nativeElement () {
        return this.elementRef.nativeElement;
    }

    constructor(private elementRef: ElementRef<HTMLElement>) {}

    ngOnInit(): void {
        
    }
}