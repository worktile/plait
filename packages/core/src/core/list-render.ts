import { ComponentRef, IterableChangeRecord, IterableDiffer, IterableDiffers, ViewContainerRef } from '@angular/core';
import {
    Ancestor,
    ComponentType,
    PlaitBoard,
    PlaitChildrenContext,
    PlaitElement,
    PlaitNode,
    PlaitPluginElementContext
} from '../interfaces';
import { PlaitPluginElementComponent } from './element/plugin-element';
import { NODE_TO_INDEX, NODE_TO_PARENT } from '../utils/weak-maps';
import { addSelectedElement, isSelectedElement, removeSelectedElement } from '../utils/selected-element';

export class ListRender {
    private children: PlaitElement[] = [];
    private componentRefs: ComponentRef<PlaitPluginElementComponent>[] = [];
    private contexts: PlaitPluginElementContext[] = [];
    private differ: IterableDiffer<any> | null = null;
    public initialized = false;

    constructor(private board: PlaitBoard, private viewContainerRef: ViewContainerRef) {}

    public initialize(children: PlaitElement[], childrenContext: PlaitChildrenContext) {
        this.initialized = true;
        this.children = children;
        children.forEach((descendant, index) => {
            NODE_TO_INDEX.set(descendant, index);
            NODE_TO_PARENT.set(descendant, childrenContext.parent);
            const context = getContext(this.board, descendant, index, childrenContext.parent);
            const componentType = getComponentType(this.board, context);
            const componentRef = createPluginComponent(componentType, context, this.viewContainerRef, childrenContext);
            this.componentRefs.push(componentRef);
            this.contexts.push(context);
        });
        // mount(this.componentRefs, childrenContext);
        const newDiffers = this.viewContainerRef.injector.get(IterableDiffers);
        this.differ = newDiffers.find(children).create(trackBy);
        this.differ.diff(children);
    }

    public update(children: PlaitElement[], childrenContext: PlaitChildrenContext) {
        if (!this.initialized) {
            this.initialize(children, childrenContext);
            return;
        }
        if (!this.differ) {
            throw new Error('Exception: Can not find differ ');
        }
        const { board, parent, parentG } = childrenContext;
        const diffResult = this.differ.diff(children);
        if (diffResult) {
            const newContexts: PlaitPluginElementContext[] = [];
            const newComponentRefs: ComponentRef<PlaitPluginElementComponent>[] = [];
            diffResult.forEachItem((record: IterableChangeRecord<any>) => {
                NODE_TO_INDEX.set(record.item, record.currentIndex as number);
                NODE_TO_PARENT.set(record.item, childrenContext.parent);
                const previousContext = record.previousIndex === null ? undefined : this.contexts[record.previousIndex];
                const context = getContext(board, record.item, record.currentIndex as number, parent, previousContext);
                if (record.previousIndex === null) {
                    const componentType = getComponentType(board, context);
                    const componentRef = createPluginComponent(componentType, context, this.viewContainerRef, childrenContext);
                    newContexts.push(context);
                    newComponentRefs.push(componentRef);
                    // mountOnItemChange(record.currentIndex as number, componentRef.instance.getContainerG(), parentG, childrenContext);
                } else {
                    const componentRef = this.componentRefs[record.previousIndex];
                    componentRef.instance.context = context;
                    newComponentRefs.push(componentRef);
                    newContexts.push(context);
                }
            });
            diffResult.forEachOperation(record => {
                // removed
                if (record.currentIndex === null) {
                    const componentRef = this.componentRefs[record.previousIndex as number];
                    componentRef?.destroy();
                }
                // moved
                if (record.previousIndex !== null && record.currentIndex !== null) {
                    const componentRef = this.componentRefs[record.previousIndex as number];
                    // mountOnItemChange(record.currentIndex, componentRef.instance.getContainerG(), parentG, childrenContext);
                }
            });
            this.componentRefs = newComponentRefs;
            this.contexts = newContexts;
            this.children = children;
        } else {
            const newContexts: PlaitPluginElementContext[] = [];
            this.children.forEach((element, index) => {
                NODE_TO_INDEX.set(element, index);
                NODE_TO_PARENT.set(element, childrenContext.parent);
                const previousContext = this.contexts[index];
                const previousComponentRef = this.componentRefs[index];
                const context = getContext(board, element, index, parent, previousContext);
                previousComponentRef.instance.context = context;
                newContexts.push(context);
            });
            this.contexts = newContexts;
        }
    }

    public destroy() {
        this.children.forEach((element: PlaitElement, index: number) => {
            if (this.componentRefs[index]) {
                this.componentRefs[index].destroy();
            }
        });
        this.componentRefs = [];
        this.children = [];
        this.contexts = [];
        this.initialized = false;
        this.differ = null;
    }
}

const trackBy = (index: number, element: PlaitElement) => {
    return element.id;
};

const createPluginComponent = (
    componentType: ComponentType<PlaitPluginElementComponent>,
    context: PlaitPluginElementContext,
    viewContainerRef: ViewContainerRef,
    childrenContext: PlaitChildrenContext
) => {
    const componentRef = viewContainerRef.createComponent(componentType);
    const instance = componentRef.instance;
    instance.context = context;
    componentRef.changeDetectorRef.detectChanges();
    const g = componentRef.instance.getContainerG();
    mountElementG(context.index, g, childrenContext);
    componentRef.instance.initializeListRender();
    return componentRef;
};

const getComponentType = (board: PlaitBoard, context: PlaitPluginElementContext) => {
    const result = board.drawElement(context);
    return result;
};

const getContext = (
    board: PlaitBoard,
    element: PlaitElement,
    index: number,
    parent: Ancestor,
    previousContext?: PlaitPluginElementContext
): PlaitPluginElementContext => {
    let isSelected = isSelectedElement(board, element);
    const previousElement = previousContext && previousContext.element;
    if (previousElement && previousElement !== element && isSelectedElement(board, previousElement)) {
        isSelected = true;
        removeSelectedElement(board, previousElement);
        addSelectedElement(board, element);
    }
    const context: PlaitPluginElementContext = {
        element: element,
        parent: parent,
        board: board,
        selected: isSelected,
        index
    };
    return context;
};

export const mountElementG = (index: number, g: SVGGElement, childrenContext: PlaitChildrenContext) => {
    const { parent, board, parentG } = childrenContext;
    let siblingG: SVGGElement | undefined;
    if (!PlaitBoard.isBoard(parent)) {
        siblingG = PlaitElement.getComponent(parent).getElementG();
    }
    if (index > 0) {
        const brotherElement = (parent.children as PlaitElement[])[index - 1];
        const lastElement = PlaitNode.last(board, PlaitBoard.findPath(board, brotherElement));
        let component = PlaitElement.getComponent(lastElement) || PlaitElement.getComponent(brotherElement);
        siblingG = component.getContainerG();
    }
    if (siblingG && isChildNode(parentG, siblingG)) {
        parentG.insertBefore(g, siblingG);
    } else {
        parentG.append(g);
    }
};

const isChildNode = (parent: Element, child: Element) => {
    if (parent.children.length > 0) {
        for (let index = 0; index < parent.children.length; index++) {
            const element = parent.children[index];
            if (element === child) {
                return true;
            }
        }
    }
    return false;
};
