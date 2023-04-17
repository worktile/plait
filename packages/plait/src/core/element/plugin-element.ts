import { ChangeDetectorRef, Directive, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { PlaitElement, PlaitPluginElementContext } from '../../interfaces';
import { addSelectedElement, isSelectedElement, removeSelectedElement } from '../../utils/selected-element';
import { createG } from '../../utils/dom';
import { hasBeforeContextChange, hasOnContextChanged } from './context-change';

@Directive()
export abstract class PlaitPluginElementComponent<T extends PlaitElement = PlaitElement> implements OnInit, OnDestroy {
    g: SVGGElement;

    get elementG() {
        return this.g;
    }

    initialized = false;

    protected _context!: PlaitPluginElementContext<T>;

    @Input()
    set context(value: PlaitPluginElementContext<T>) {
        if (hasBeforeContextChange<T>(this)) {
            this.beforeContextChange(value);
        }
        const previousContext = this._context;
        this._context = value;
        if (this.element) {
            ELEMENT_TO_PLUGIN_COMPONENT.set(this.element, this);
        }
        if (this.initialized) {
            this.cdr.markForCheck();
            if (hasOnContextChanged<T>(this)) {
                this.onContextChanged(value, previousContext);
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

    constructor(protected cdr: ChangeDetectorRef) {
        this.g = createG();
    }

    ngOnInit(): void {
        if (this.element.type) {
            this.g.setAttribute(`plait-${this.element.type}`, 'true');
        }
        this.initialized = true;
    }

    ngOnDestroy(): void {
        if (ELEMENT_TO_PLUGIN_COMPONENT.get(this.element) === this) {
            ELEMENT_TO_PLUGIN_COMPONENT.delete(this.element);
        }
        removeSelectedElement(this.board, this.element);
        this.g.remove();
    }
}

export const ELEMENT_TO_PLUGIN_COMPONENT = new WeakMap<PlaitElement, PlaitPluginElementComponent>();
