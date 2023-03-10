import { ChangeDetectorRef, Directive, Input, OnDestroy, OnInit } from '@angular/core';
import { PlaitElement, PlaitPluginElementContext } from '../../interfaces';
import { addSelectedElement, isSelectedElement, removeSelectedElement } from '../../utils/selected-element';
import { createG } from '../../utils/dom';
import { hasBeforeContextChange } from './before-context-change';

@Directive()
export abstract class PlaitPluginElementComponent<T extends PlaitElement = PlaitElement> implements OnInit, OnDestroy {
    g: SVGGElement;

    initialized = false;

    protected _context!: PlaitPluginElementContext<T>;

    @Input()
    set context(value: PlaitPluginElementContext<T>) {
        if (hasBeforeContextChange<T>(this)) {
            this.beforeContextChange(value);
        }
        const elementChanged = this.element && this.element !== value.element;
        if (elementChanged) {
            if (isSelectedElement(this.board, this.element)) {
                removeSelectedElement(this.board, this.element);
                addSelectedElement(this.board, value.element);
            }
        }
        this._context = value;
        if (this.element) {
            ELEMENT_TO_PLUGIN_COMPONENT.set(this.element, this);
        }
        this.onContextChange();
    }

    get context() {
        return this._context;
    }

    get element() {
        return this.context && this.context.element;
    }

    get selection() {
        return this.context && this.context.selection;
    }

    get board() {
        return this.context && this.context.board;
    }

    get host() {
        return this.context && this.context.host;
    }

    constructor(public cdr: ChangeDetectorRef) {
        this.g = createG();
    }

    onContextChange() {
        if (!this.initialized) {
            return;
        }
        this.cdr.markForCheck();
    }

    ngOnInit(): void {
        const type = this.element?.type || 'default-plugin-element';
        this.g.setAttribute(`plait-${type}`, 'true');
        this.initialized = true;
    }

    ngOnDestroy(): void {
        ELEMENT_TO_PLUGIN_COMPONENT.delete(this.element);
        removeSelectedElement(this.board, this.element);
        this.g.remove();
    }
}

export const ELEMENT_TO_PLUGIN_COMPONENT = new WeakMap<PlaitElement, PlaitPluginElementComponent>();
