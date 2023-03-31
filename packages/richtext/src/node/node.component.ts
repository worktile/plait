import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Input,
    OnChanges,
    OnInit,
    Renderer2,
    SimpleChange,
    SimpleChanges
} from '@angular/core';
import { Text, Element, Editor, Node } from 'slate';
import { CustomElement } from '../interface/custom-element';
import { renderElement } from '../render/element';
import { renderText } from '../render/text';
import { updateWeakMap } from '../utils/node-relation';

@Component({
    selector: 'plait-node',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'plait-node'
    }
})
export class PlaitNodeComponent implements OnInit, AfterViewInit, OnChanges {
    @Input()
    node!: Node;

    @Input()
    index = 0;

    @Input()
    parent!: Element;

    @Input()
    editor!: Editor;

    initialized = false;

    get isLastNode() {
        if (this.parent && this.node) {
            return this.index === this.parent.children.length - 1;
        }
        return false;
    }

    constructor(private elementRef: ElementRef<HTMLElement>, public renderer2: Renderer2) {}

    ngOnInit(): void {
        updateWeakMap(this.node, this.index, this.parent, this.elementRef.nativeElement);
        if (CustomElement.isCustomElement(this.node)) {
            this.elementRef.nativeElement.setAttribute('node-type', this.node.type);
        }
    }

    ngAfterViewInit(): void {
        this.renderNode();
        this.initialized = true;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!this.initialized) {
            return;
        }
        const nodeChange = changes['node'];
        if (nodeChange) {
            this.renderNode(nodeChange);
        }
        updateWeakMap(this.node, this.index, this.parent, this.elementRef.nativeElement);
    }

    renderNode(nodeChange?: SimpleChange) {
        if (Text.isText(this.node)) {
            renderText(this.editor, this.elementRef.nativeElement, this.node, this.isLastNode);
        } else {
            renderElement(this.editor, this.elementRef.nativeElement, this.node as any, this.isLastNode, nodeChange);
        }
    }
}
