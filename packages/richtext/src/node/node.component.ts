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
    selector: 'plait-node, span[plaitNode]',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaitNodeComponent implements OnInit, AfterViewInit, OnChanges {
    @HostBinding('class') classHost = 'plait-text-node';

    @HostBinding('[attr.data-plait-node]') nodeType = 'text';

    attributes: string[] = [];

    @Input()
    node?: Text | any;

    @Input()
    index = 0;

    @Input()
    parent?: Element;

    @Input()
    editor!: Editor;

    initialized = false;

    get textContent() {
        if (this.node && Text.isText(this.node)) {
            return this.node.text;
        }
        return '';
    }

    get domTextContent() {
        return this.elementRef.nativeElement.textContent;
    }

    get isLastNode() {
        if (this.parent && this.node) {
            return this.index === this.parent.children.length - 1;
        }
        return false;
    }

    constructor(private elementRef: ElementRef<HTMLElement>, public renderer2: Renderer2) {}

    ngOnInit(): void {
        this.updateWeakMap();
    }

    updateWeakMap() {
        if (this.node) {
            ELEMENT_TO_NODE.set(this.elementRef.nativeElement, this.node);
            NODE_TO_ELEMENT.set(this.node, this.elementRef.nativeElement);
            NODE_TO_INDEX.set(this.node, this.index);
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
        const nodeChange = changes['node'];
        if (nodeChange && !IS_NATIVE_INPUT.get(this.editor)) {
            this.renderText();
        }
        this.updateWeakMap();
    }

    renderText() {
        let withZeroWidthChar = false;
        if (this.isLastNode && this.node && (this.node.text === '' || this.node.text.endsWith(`\n`))) {
            withZeroWidthChar = true;
            this.elementRef.nativeElement.setAttribute(WITH_ZERO_WIDTH_CHAR, 'true');
        } else {
            this.elementRef.nativeElement.setAttribute(WITH_ZERO_WIDTH_CHAR, 'false');
        }
        const textContent = this.textContent + (withZeroWidthChar ? ZERO_WIDTH_CHAR : '');
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
        for (const key in this.node) {
            if (Object.prototype.hasOwnProperty.call(this.node, key) && key !== 'text' && !!this.node[key]) {
                const attr = `slate-${key}`;
                this.renderer2.setAttribute(this.elementRef.nativeElement, attr, 'true');
                this.attributes.push(attr);
            }
        }
    }
}
