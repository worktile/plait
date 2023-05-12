import { ChangeDetectorRef, Directive, Input, OnDestroy, OnInit } from '@angular/core';
import { PlaitBoard, PlaitElement, PlaitPluginElementContext } from '../../interfaces';
import { removeSelectedElement } from '../../utils/selected-element';
import { createG } from '../../utils/dom';
import { hasBeforeContextChange, hasOnContextChanged } from './context-change';

@Directive()
export abstract class PlaitPluginElementComponent<T extends PlaitElement = PlaitElement, K extends PlaitBoard = PlaitBoard>
    implements OnInit, OnDestroy {
    g!: SVGGElement;

    rootG?: SVGGElement;

    initialized = false;

    protected _context!: PlaitPluginElementContext<T, K>;

    @Input()
    set context(value: PlaitPluginElementContext<T, K>) {
        if (hasBeforeContextChange<T, K>(this)) {
            this.beforeContextChange(value);
        }
        const previousContext = this._context;
        this._context = value;
        if (this.element) {
            ELEMENT_TO_COMPONENT.set(this.element, this);
        }
        if (this.initialized) {
            this.cdr.markForCheck();
            if (hasOnContextChanged<T>(this)) {
                this.onContextChanged(value, previousContext);
            }
        } else {
            if (PlaitElement.isRootElement(this.element) && this.element.children && this.element.children.length > 0) {
                this.g = createG();
                this.rootG = createG();
                this.rootG.append(this.g);
            } else {
                this.g = createG();
            }
        }
    }

    get context() {
        return this._context;
    }

    get element() {
        return this.context && this.context.element;
    }

    get board() {
        return this.context && this.context.board;
    }

    get selected() {
        return this.context && this.context.selected;
    }

    get effect() {
        return this.context && this.context.effect;
    }

    constructor(protected cdr: ChangeDetectorRef) {}

    ngOnInit(): void {
        if (this.element.type) {
            (this.rootG || this.g).setAttribute(`plait-${this.element.type}`, 'true');
        }
        this.initialized = true;
    }

    ngOnDestroy(): void {
        if (ELEMENT_TO_COMPONENT.get(this.element) === this) {
            ELEMENT_TO_COMPONENT.delete(this.element);
        }
        removeSelectedElement(this.board, this.element);
        (this.rootG || this.g).remove();
    }
}

export const ELEMENT_TO_COMPONENT = new WeakMap<PlaitElement, PlaitPluginElementComponent>();
