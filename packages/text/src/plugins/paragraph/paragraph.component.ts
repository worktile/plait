import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { BaseElementComponent, SlateChildren } from 'slate-angular';
import { ParagraphElement } from '../../custom-types';

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

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
