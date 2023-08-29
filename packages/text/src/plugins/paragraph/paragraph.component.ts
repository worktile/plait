import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { BaseElementComponent } from 'slate-angular';
import { ParagraphElement } from '../../custom-types';

@Component({
    selector: 'div[plaitTextParagraphElement]',
    template: `
        <slate-children [children]="children" [context]="childrenContext" [viewContext]="viewContext"></slate-children>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParagraphElementComponent extends BaseElementComponent<ParagraphElement> implements OnInit {
    ngOnInit(): void {
        super.ngOnInit();
        this.applyAlign();
    }

    applyAlign() {
        if (this.element.align) {
            this.nativeElement.style.textAlign = this.element.align;
        } else if (this.nativeElement.style.textAlign) {
            this.nativeElement.style.removeProperty('text-align');
        }
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
