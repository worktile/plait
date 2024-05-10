import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { BaseElementComponent, SlateChildren } from 'slate-angular';
import { ParagraphElement, WritingMode } from '../../custom-types';

@Component({
    selector: 'div[plaitTextParagraphElement]',
    template: `
        <slate-children [children]="children" [context]="childrenContext" [viewContext]="viewContext"></slate-children>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [SlateChildren]
})
export class ParagraphElementComponent extends BaseElementComponent<ParagraphElement> implements OnInit {
    ngOnInit(): void {
        super.ngOnInit();
        this.applyAlign();
        this.applyWritingMode();
    }

    onContextChange(): void {
        super.onContextChange();
        if (this.initialized) {
            this.applyAlign();
        }
    }

    applyAlign() {
        if (this.element.align) {
            if (this.nativeElement.style.textAlign !== this.element.align) {
                this.nativeElement.style.textAlign = this.element.align;
            }
        } else if (this.nativeElement.style.textAlign) {
            this.nativeElement.style.removeProperty('text-align');
        }
    }

    applyWritingMode() {
        if (this.element.writingMode) {
            if (this.nativeElement.style.writingMode !== this.element.writingMode) {
                this.nativeElement.style.writingMode = this.element.writingMode;
            }
            if (this.element.writingMode === WritingMode.verticalLR) {
                this.nativeElement.style.transform = 'rotate(-180deg)';
            }
        } else if (this.nativeElement.style.writingMode) {
            this.nativeElement.style.removeProperty('writing-mode');
            this.nativeElement.style.removeProperty('transform');
        }
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
