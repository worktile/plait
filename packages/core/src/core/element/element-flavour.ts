/**
 * 基于 element-flavour 实现元素的绘制，取代 Angular 组件
 */

import { PlaitBoard, PlaitChildrenContext, PlaitElement, PlaitNode, PlaitPluginElementContext } from '../../interfaces';
import { removeSelectedElement } from '../../utils/selected-element';
import { createG } from '../../utils/dom/common';
import { hasBeforeContextChange, hasOnContextChanged } from './context-change';
import { ListRender } from '../list-render';
import { ELEMENT_TO_REF, NODE_TO_CONTAINER_G, NODE_TO_G } from '../../utils/weak-maps';
import { PlaitElementRef } from './element-ref';

export class ElementFlavour<
    T extends PlaitElement = PlaitElement,
    K extends PlaitBoard = PlaitBoard,
    R extends PlaitElementRef = PlaitElementRef
> {
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

    set context(value: PlaitPluginElementContext<T, K>) {
        if (hasBeforeContextChange<T, K>(this)) {
            this.beforeContextChange(value);
        }
        const previousContext = this._context;
        this._context = value;
        if (this.initialized) {
            const elementG = this.getElementG();
            const containerG = this.getContainerG();
            NODE_TO_G.set(this.element, elementG);
            NODE_TO_CONTAINER_G.set(this.element, containerG);
            ELEMENT_TO_REF.set(this.element, this.ref);
            this.updateListRender();
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
            ELEMENT_TO_REF.set(this.element, this.ref);
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

    constructor(private ref: R) {}

    initialize() {
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
            this.listRender = new ListRender(this.board);
            if (this.board.isExpanded(this.element)) {
                this.listRender.initialize(this.element.children!, this.initializeChildrenContext());
            }
        }
    }

    public getRef() {
        return this.ref;
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

    destroy() {
        if (NODE_TO_G.get(this.element) === this._g) {
            NODE_TO_G.delete(this.element);
        }
        if (NODE_TO_CONTAINER_G.get(this.element) === this._containerG) {
            NODE_TO_CONTAINER_G.delete(this.element);
        }
        if (ELEMENT_TO_REF.get(this.element) === this.ref) {
            ELEMENT_TO_REF.set(this.element, this.ref);
        }
        removeSelectedElement(this.board, this.element);
        this.getContainerG().remove();
        this.listRender?.destroy();
    }
}
