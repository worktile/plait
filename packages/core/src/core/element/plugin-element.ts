import { ChangeDetectorRef, Directive, Input, OnDestroy, OnInit, ViewContainerRef, inject } from '@angular/core';
import { PlaitBoard, PlaitChildrenContext, PlaitElement, PlaitNode, PlaitPluginElementContext } from '../../interfaces';
import { removeSelectedElement } from '../../utils/selected-element';
import { createG } from '../../utils/dom/common';
import { hasBeforeContextChange, hasOnContextChanged } from './context-change';
import { ListRender } from '../list-render';
import { NODE_TO_CONTAINER_G, NODE_TO_G } from '../../utils/weak-maps';

@Directive()
export abstract class PlaitPluginElementComponent<T extends PlaitElement = PlaitElement, K extends PlaitBoard = PlaitBoard>
    implements OnInit, OnDestroy {
    viewContainerRef = inject(ViewContainerRef);

    private _g!: SVGGElement;

    private _containerG!: SVGGElement;

    // children elements's render need rootContainerG
    // the value of rootContainerG come from the containerG of root element
    private _rootContainerG?: SVGGElement;

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
            const containerG = this.getContainerG();
            NODE_TO_G.set(this.element, elementG);
            NODE_TO_CONTAINER_G.set(this.element, containerG);
            this.updateListRender();
            this.cdr.markForCheck();
            if (hasOnContextChanged<T>(this)) {
                this.onContextChanged(value, previousContext);
            }
        } else {
            if (PlaitElement.isRootElement(this.element) && this.hasChildren) {
                this._g = createG();
                this._containerG = createG();
                this._containerG.append(this._g);
            } else {
                this._g = createG();
                this._containerG = this._g;
            }
            NODE_TO_G.set(this.element, this._g);
            NODE_TO_CONTAINER_G.set(this.element, this._containerG);
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
        if (this.hasChildren) {
            if (PlaitElement.isRootElement(this.element)) {
                this._rootContainerG = this._containerG;
            } else {
                const path = PlaitBoard.findPath(this.board, this.element);
                const rootNode = PlaitNode.get(this.board, path.slice(0, 1));
                this._rootContainerG = PlaitElement.getContainerG(rootNode, { suppressThrow: false });
            }
        }
        this.getContainerG().setAttribute('plait-data-id', this.element.id);
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
        if (!this._rootContainerG) {
            throw new Error('can not resolve root container g');
        }
        return {
            board: this.board,
            parent: this.element,
            parentG: this._rootContainerG
        };
    }

    ngOnDestroy(): void {
        if (ELEMENT_TO_COMPONENT.get(this.element) === this) {
            ELEMENT_TO_COMPONENT.delete(this.element);
        }
        if (NODE_TO_G.get(this.element) === this._g) {
            NODE_TO_G.delete(this.element);
        }
        if (NODE_TO_CONTAINER_G.get(this.element) === this._containerG) {
            NODE_TO_CONTAINER_G.delete(this.element);
        }
        removeSelectedElement(this.board, this.element);
        this.getContainerG().remove();
    }
}

export const ELEMENT_TO_COMPONENT = new WeakMap<PlaitElement, PlaitPluginElementComponent>();
