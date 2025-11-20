import { CustomText } from '@plait/common';
import { MarkTypes } from '@plait/text-plugins';
import { DefaultTextFlavour } from 'slate-angular';

export class TextFlavour extends DefaultTextFlavour {
    excludes = ['color', 'font-size', 'text'];

    attributes: string[] = [];

    render() {
        super.render();
        this.applyRichtext();
    }

    applyRichtext() {
        const text = this.text as CustomText;
        this.attributes.forEach((attr) => {
            this.nativeElement.removeAttribute(attr);
        });
        this.attributes = [];
        for (const key in text) {
            if (Object.prototype.hasOwnProperty.call(text, key) && !this.excludes.includes(key)) {
                const attr = `plait-${key}`;
                this.nativeElement.setAttribute(attr, 'true');
                this.attributes.push(attr);
            }
        }

        const fontSize = text[MarkTypes.fontSize];
        this.nativeElement.setAttribute(`plait-${MarkTypes.fontSize}`, fontSize ? fontSize : '');
        if (text[MarkTypes.color]) {
            this.nativeElement.style.color = text[MarkTypes.color];
        } else {
            this.nativeElement.style.color = '';
        }
    }

    onContextChange() {
        super.onContextChange();
        if (this.initialized) {
            this.applyRichtext();
        }
    }
}
