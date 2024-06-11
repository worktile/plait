import { ChangeDetectionStrategy, Component, ElementRef, OnInit, inject } from '@angular/core';
import { MindEmojiBaseComponent } from '@plait/mind';

@Component({
    selector: 'app-mind-node-emoji',
    template: ``,
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MindEmojiComponent extends MindEmojiBaseComponent implements OnInit {
    elementRef = inject(ElementRef<HTMLElement>)

    nativeElement() {
        return this.elementRef.nativeElement;
    }

    ngOnInit(): void {
        super.initialize();
        this.nativeElement().innerHTML = this.emojiItem.name;
    }
}
