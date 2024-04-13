import { ChangeDetectorRef, Directive, ElementRef, Input, OnDestroy, OnInit, ViewContainerRef, inject } from '@angular/core';
import { PlaitBoard, PlaitChildrenContext, PlaitElement, PlaitNode, PlaitPluginElementContext } from '../../interfaces';
import { removeSelectedElement } from '../../utils/selected-element';
import { createG } from '../../utils/dom/common';
import { hasBeforeContextChange, hasOnContextChanged } from './context-change';
import { ListRender, mountElementG } from '../list-render';
import { NODE_TO_CONTAINER_G, NODE_TO_G, NODE_TO_PARENT_G } from '../../utils/weak-maps';

@Directive()
export abstract class PlaitPluginElementComponent<T extends PlaitElement = PlaitElement, K extends PlaitBoard = PlaitBoard>
    implements OnInit, OnDestroy {
    viewContainerRef = inject(ViewContainerRef);

    private _g!: SVGGElement;

    private _parentG?: SVGGElement;

    private _containerG!: SVGGElement;

    initialized = false;

    protected _context!: PlaitPluginElementContext<T, K>;

    get hasChildren() {
        return !!this.element.children;
    }

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
            const elementG = this.getElementG();
            const parentG = this.getParentG();
            const containerG = this.getContainerG();
            NODE_TO_G.set(this.element, elementG);
            NODE_TO_CONTAINER_G.set(this.element, containerG);
            parentG && PlaitElement.isRootElement(this.element) && NODE_TO_PARENT_G.set(this.element, parentG);
            this.updateListRender();
            this.cdr.markForCheck();
            if (hasOnContextChanged<T>(this)) {
                this.onContextChanged(value, previousContext);
            }
        } else {
            if (PlaitElement.isRootElement(this.element) && this.hasChildren) {
                this._g = createG();
                this._parentG = createG();
                this._parentG.append(this._g);
                this._containerG = this._parentG;
            } else {
                this._g = createG();
                this._containerG = this._g;
            }
            const elementG = this.getElementG();
            const parentG = this.getParentG();
            const containerG = this.getContainerG();
            NODE_TO_G.set(this.element, elementG);
            NODE_TO_CONTAINER_G.set(this.element, containerG);
            parentG && NODE_TO_PARENT_G.set(this.element, parentG);
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

    listRender?: ListRender;

    getParentG() {
        return this._parentG;
    }

    getContainerG() {
        return this._containerG;
    }

    getElementG() {
        return this._g;
    }

    constructor(protected cdr: ChangeDetectorRef) {}

    ngOnInit(): void {
        if (this.element.type) {
            this.getContainerG().setAttribute(`plait-${this.element.type}`, 'true');
        }
        this.getContainerG().setAttribute('plait-data-id', this.element.id);
        if (!PlaitElement.isRootElement(this.element)) {
            const path = PlaitBoard.findPath(this.board, this.element);
            const rootNode = PlaitNode.get(this.board, path.slice(0, 1));
            this._parentG = PlaitElement.getParentG(rootNode);
        }
        this.initialized = true;
    }

    public initializeListRender() {
        if (this.hasChildren) {
            this.listRender = new ListRender(this.board, this.viewContainerRef);
            if (this.board.isExpanded(this.element)) {
                this.listRender.initialize(this.element.children!, this.initializeChildrenContext());
            }
        }
    }

    private updateListRender() {
        if (this.hasChildren) {
            if (!this.listRender) {
                throw new Error('incorrectly initialize list render');
            }
            if (this.board.isExpanded(this.element)) {
                this.listRender.update(this.element.children!, this.initializeChildrenContext());
            } else {
                if (this.listRender.initialized) {
                    this.listRender.destroy();
                }
            }
        }
    }

    private initializeChildrenContext(): PlaitChildrenContext {
        const parentG = this.getParentG();
        if (!parentG) {
            throw new Error('parent g is not initialized incorrectly');
        }
        return {
            board: this.board,
            parent: this.element,
            parentG
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
