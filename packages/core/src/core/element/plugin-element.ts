import { ChangeDetectorRef, Directive, ElementRef, Input, OnDestroy, OnInit, ViewContainerRef, inject } from '@angular/core';
import { PlaitBoard, PlaitChildrenContext, PlaitElement, PlaitPluginElementContext } from '../../interfaces';
import { removeSelectedElement } from '../../utils/selected-element';
import { createG } from '../../utils/dom/common';
import { hasBeforeContextChange, hasOnContextChanged } from './context-change';
import { ListRender, mountElementG } from '../list-render';

@Directive()
export abstract class PlaitPluginElementComponent<T extends PlaitElement = PlaitElement, K extends PlaitBoard = PlaitBoard>
    implements OnInit, OnDestroy {
    viewContainerRef = inject(ViewContainerRef);

    private g!: SVGGElement;

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
            this.updateListRender();
            this.cdr.markForCheck();
            if (hasOnContextChanged<T>(this)) {
                this.onContextChanged(value, previousContext);
            }
        } else {
            this.g = createG();
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

    listRender!: ListRender;

    // 子元素容器 g
    getParentG() {
        return this.g;
    }

    // ListRender 操作节点时的 g
    getContainerG() {
        return this.g;
    }

    // 元素特定 g
    getElementG() {
        return this.g;
    }

    constructor(protected cdr: ChangeDetectorRef) {}

    ngOnInit(): void {
        if (this.element.type) {
            this.getContainerG().setAttribute(`plait-${this.element.type}`, 'true');
        }
        this.getContainerG().setAttribute('plait-data-id', this.element.id);
        this.initialized = true;
    }

    public initializeListRender() {
        this.listRender = new ListRender(this.board, this.viewContainerRef);
        if (this.element.children && this.board.isExpanded(this.element)) {
            this.listRender.initialize(this.element.children, this.initializeChildrenContext());
        }
    }

    private updateListRender() {
        if (this.element.children) {
            if (this.board.isExpanded(this.element)) {
                this.listRender.update(this.element.children, this.initializeChildrenContext());
            } else {
                if (this.listRender.initialized) {
                    this.listRender.destroy();
                }
            }
        }
    }

    private initializeChildrenContext(): PlaitChildrenContext {
        return {
            board: this.board,
            parent: this.element,
            parentG: this.getParentG()
        };
    }

    ngOnDestroy(): void {
        if (ELEMENT_TO_COMPONENT.get(this.element) === this) {
            ELEMENT_TO_COMPONENT.delete(this.element);
        }
        removeSelectedElement(this.board, this.element);
        this.getContainerG().remove();
    }
}

export const ELEMENT_TO_COMPONENT = new WeakMap<PlaitElement, PlaitPluginElementComponent>();
