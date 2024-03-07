import { ChangeDetectionStrategy, Component, ElementRef, Input, OnInit } from '@angular/core';
import { MindEmojiBaseComponent } from '@plait/mind';

@Component({
    selector: 'app-mind-node-emoji',
    template: ``,
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MindEmojiComponent extends MindEmojiBaseComponent implements OnInit {
    constructor(protected elementRef: ElementRef<HTMLElement>) {
        super(elementRef);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.nativeElement.innerHTML = this.emojiItem.name;
    }
}
