import { ParagraphElement } from '@plait/common';
import { AngularEditor, BaseElementFlavour } from 'slate-angular';

export class ParagraphFlavour<
    T extends ParagraphElement = ParagraphElement,
    K extends AngularEditor = AngularEditor
> extends BaseElementFlavour<T, K> {
    render() {
        const nativeElement = this.createNativeElement();
        this.nativeElement = nativeElement;
        this.nativeElement.classList.add(`plait-text-paragraph`);
        this.applyAlign();
    }

    rerender() {
        this.applyAlign();
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

    createNativeElement(): HTMLElement {
        return document.createElement('div');
    }
}
