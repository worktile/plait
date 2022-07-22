import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    HostBinding,
    Input,
    OnChanges,
    OnInit,
    Renderer2,
    SimpleChanges
} from '@angular/core';
import { WITH_ZERO_WIDTH_CHAR, ZERO_WIDTH_CHAR } from '../utils/dom';
import { Text, Element, Editor } from 'slate';
import { ELEMENT_TO_NODE, IS_NATIVE_INPUT, NODE_TO_ELEMENT, NODE_TO_INDEX } from '../utils/weak-maps';

@Component({
    selector: 'plait-text, span[plaitTextNode]',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaitTextComponent implements OnInit, AfterViewInit, OnChanges {
    @HostBinding('class') classHost = 'plait-text-node';

    @HostBinding('[attr.data-plait-node]') nodeType = 'text';

    attributes: string[] = [];

    @Input()
    text?: Text | any;

    @Input()
    index = 0;

    @Input()
    parent?: Element;

    @Input()
    editor!: Editor;

    initialized = false;

    get dataTextContent() {
        if (this.text && Text.isText(this.text)) {
            return this.text.text;
        }
        return '';
    }

    get domTextContent() {
        return this.elementRef.nativeElement.textContent;
    }

    get isLastText() {
        if (this.parent && this.text) {
            return this.index === this.parent.children.length - 1;
        }
        return false;
    }

    constructor(private elementRef: ElementRef<HTMLElement>, public renderer2: Renderer2) {}

    ngOnInit(): void {
        this.updateWeakMap();
    }

    updateWeakMap() {
        if (this.text) {
            ELEMENT_TO_NODE.set(this.elementRef.nativeElement, this.text);
            NODE_TO_ELEMENT.set(this.text, this.elementRef.nativeElement);
            NODE_TO_INDEX.set(this.text, this.index);
        }
    }

    ngAfterViewInit(): void {
        this.renderText();
        this.initialized = true;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!this.initialized) {
            return;
        }
        const textChange = changes['text'];
        if (textChange && !IS_NATIVE_INPUT.get(this.editor)) {
            this.renderText();
        }
        this.updateWeakMap();
    }

    renderText() {
        let withZeroWidthChar = false;
        if (this.isLastText && this.text && (this.text.text === '' || this.text.text.endsWith(`\n`))) {
            withZeroWidthChar = true;
            this.elementRef.nativeElement.setAttribute(WITH_ZERO_WIDTH_CHAR, 'true');
        } else {
            this.elementRef.nativeElement.setAttribute(WITH_ZERO_WIDTH_CHAR, 'false');
        }
        const textContent = this.dataTextContent + (withZeroWidthChar ? ZERO_WIDTH_CHAR : '');
        if (this.domTextContent !== textContent) {
            this.elementRef.nativeElement.textContent = textContent;
        }
        if (this.elementRef.nativeElement.childNodes.length === 0) {
            const textNode = document.createTextNode('');
            this.elementRef.nativeElement.appendChild(textNode);
        }
        this.applyTextMarks();
    }

    applyTextMarks() {
        this.attributes.forEach(attr => {
            this.renderer2.removeAttribute(this.elementRef.nativeElement, attr);
        });
        this.attributes = [];
        for (const key in this.text) {
            if (Object.prototype.hasOwnProperty.call(this.text, key) && key !== 'text' && !!this.text[key]) {
                const attr = `slate-${key}`;
                this.renderer2.setAttribute(this.elementRef.nativeElement, attr, 'true');
                this.attributes.push(attr);
            }
        }
    }
}
