import { ChangeDetectorRef, Component, ElementRef, Renderer2 } from '@angular/core';
import { BaseTextComponent, SlateLeaves } from 'slate-angular';
import { MarkTypes } from '../constant/mark';
import { CustomText } from '../custom-types';

@Component({
    selector: 'span[plaitText]',
    template: `
        <slate-leaves [context]="context" [viewContext]="viewContext"></slate-leaves>
    `,
    host: {
        'data-slate-node': 'text'
    },
    standalone: true,
    imports: [SlateLeaves]
})
export class PlaitTextNodeComponent extends BaseTextComponent<CustomText> {
    constructor(public elementRef: ElementRef, public renderer2: Renderer2, cdr: ChangeDetectorRef) {
        super(elementRef, cdr);
    }

    excludes = ['color', 'font-size', 'text'];
    attributes: string[] = [];

    applyTextMark() {
        this.attributes.forEach(attr => {
            this.renderer2.removeAttribute(this.elementRef.nativeElement, attr);
        });
        this.attributes = [];
        for (const key in this.text) {
            if (Object.prototype.hasOwnProperty.call(this.text, key) && !this.excludes.includes(key)) {
                const attr = `the-${key}`;
                this.renderer2.setAttribute(this.elementRef.nativeElement, attr, 'true');
                this.attributes.push(attr);
            }
        }

        const fontSize = this.text[MarkTypes.fontSize];
        if (fontSize) {
            this.renderer2.setAttribute(this.elementRef.nativeElement, `plait-${MarkTypes.fontSize}`, fontSize);
        } else {
            this.renderer2.removeAttribute(this.elementRef.nativeElement, `plait-${MarkTypes.fontSize}`);
        }

        if (this.text[MarkTypes.color]) {
            this.renderer2.setStyle(this.elementRef.nativeElement, 'color', this.text[MarkTypes.color]);
        } else {
            this.renderer2.removeStyle(this.elementRef.nativeElement, 'color');
        }
    }

    onContextChange() {
        super.onContextChange();
        this.applyTextMark();
    }
}
