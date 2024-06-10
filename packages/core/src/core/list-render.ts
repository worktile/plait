import {
    Ancestor,
    ComponentType,
    PlaitBoard,
    PlaitChildrenContext,
    PlaitElement,
    PlaitNode,
    PlaitPluginElementContext
} from '../interfaces';
import { NODE_TO_INDEX, NODE_TO_PARENT } from '../utils/weak-maps';
import { addSelectedElement, isSelectedElement, removeSelectedElement } from '../utils/selected-element';
import { ElementFlavour } from './element/element-flavour';
import { DefaultIterableDiffer } from '../differs/default_iterable_differ';
import { IterableChangeRecord, IterableDiffer } from '../differs/iterable_differs';

export class ListRender {
    private children: PlaitElement[] = [];
    private instances: ElementFlavour[] = [];
    private contexts: PlaitPluginElementContext[] = [];
    private differ: IterableDiffer<PlaitElement> | null = null;
    public initialized = false;

    constructor(private board: PlaitBoard) {}

    public initialize(children: PlaitElement[], childrenContext: PlaitChildrenContext) {
        this.initialized = true;
        this.children = children;
        children.forEach((descendant, index) => {
            NODE_TO_INDEX.set(descendant, index);
            NODE_TO_PARENT.set(descendant, childrenContext.parent);
            const context = getContext(this.board, descendant, index, childrenContext.parent);
            const componentType = getComponentType(this.board, context);
            const instance = createPluginComponent(this.board, componentType, context, childrenContext);
            this.instances.push(instance);
            this.contexts.push(context);
        });
        this.differ = new DefaultIterableDiffer<PlaitElement>(trackBy);
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
        const { board, parent } = childrenContext;
        const diffResult = this.differ.diff(children);
        if (diffResult) {
            const newContexts: PlaitPluginElementContext[] = [];
            const newInstances: ElementFlavour[] = [];
            let currentIndexForFirstElement: number | null = null;
            diffResult.forEachItem((record: IterableChangeRecord<PlaitElement>) => {
                NODE_TO_INDEX.set(record.item, record.currentIndex as number);
                NODE_TO_PARENT.set(record.item, childrenContext.parent);
                const previousContext = record.previousIndex === null ? undefined : this.contexts[record.previousIndex];
                const context = getContext(board, record.item, record.currentIndex as number, parent, previousContext);
                if (record.previousIndex === null) {
                    const componentType = getComponentType(board, context);
                    const componentRef = createPluginComponent(board, componentType, context, childrenContext);
                    newContexts.push(context);
                    newInstances.push(componentRef);
                } else {
                    const instance = this.instances[record.previousIndex];
                    instance.context = context;
                    newInstances.push(instance);
                    newContexts.push(context);
                }
                // item might has been changed, so need to compare the id
                if (record.item === this.children[0] || record.item.id === this.children[0]?.id) {
                    currentIndexForFirstElement = record.currentIndex;
                }
            });
            diffResult.forEachOperation(record => {
                // removed
                if (record.currentIndex === null) {
                    const componentRef = this.instances[record.previousIndex as number];
                    componentRef?.destroy();
                }
                // moved
                if (record.previousIndex !== null && record.currentIndex !== null) {
                    mountOnItemMove(record.item, record.currentIndex, childrenContext, currentIndexForFirstElement);
                }
            });
            this.instances = newInstances;
            this.contexts = newContexts;
            this.children = children;
        } else {
            const newContexts: PlaitPluginElementContext[] = [];
            this.children.forEach((element, index) => {
                NODE_TO_INDEX.set(element, index);
                NODE_TO_PARENT.set(element, childrenContext.parent);
                const previousContext = this.contexts[index];
                const previousInstance = this.instances[index];
                const context = getContext(board, element, index, parent, previousContext);
                previousInstance.context = context;
                newContexts.push(context);
            });
            this.contexts = newContexts;
        }
    }

    public destroy() {
        this.children.forEach((element: PlaitElement, index: number) => {
            if (this.instances[index]) {
                this.instances[index].destroy();
            }
        });
        this.instances = [];
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
    board: PlaitBoard,
    componentType: ComponentType<ElementFlavour>,
    context: PlaitPluginElementContext,
    childrenContext: PlaitChildrenContext
) => {
    const instance = new componentType();
    instance.context = context;
    instance.initialize();
    const g = instance.getContainerG();
    mountElementG(context.index, g, childrenContext);
    instance.initializeListRender();
    return instance;
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

// the g depth of root element：[1]-[2]-[3]-[4]
// the g depth of root element and children element（the [2] element has children）：
// [1]-
// [2]([2-1-1][2-1-2][2-1][2-2][2-3-1][2-3-2][2-3][2])-
// [3]-
// [4]
export const mountElementG = (
    index: number,
    g: SVGGElement,
    childrenContext: PlaitChildrenContext,
    // for moving scene: the current index for first element before moving
    currentIndexForFirstElement: number | null = null
) => {
    const { parent, parentG } = childrenContext;
    if (PlaitBoard.isBoard(parent)) {
        if (index > 0) {
            const previousElement = parent.children[index - 1];
            const previousContainerG = PlaitElement.getContainerG(previousElement, { suppressThrow: false });
            previousContainerG.insertAdjacentElement('afterend', g);
        } else {
            if (currentIndexForFirstElement !== null) {
                const firstElement = parent.children[currentIndexForFirstElement];
                const firstContainerG = firstElement && PlaitElement.getContainerG(firstElement, { suppressThrow: true });
                if (firstElement && firstContainerG) {
                    parentG.insertBefore(g, firstContainerG);
                } else {
                    throw new Error('fail to mount container on moving');
                }
            } else {
                parentG.append(g);
            }
        }
    } else {
        if (index > 0) {
            const previousElement = (parent.children as PlaitElement[])[index - 1];
            const previousElementG = PlaitElement.getElementG(previousElement);
            previousElementG.insertAdjacentElement('afterend', g);
        } else {
            if (currentIndexForFirstElement) {
                const nextElement = (parent.children as PlaitElement[])[currentIndexForFirstElement];
                const nextPath = nextElement && PlaitBoard.findPath(childrenContext.board, nextElement);
                const first = nextPath && PlaitNode.first(childrenContext.board, nextPath);
                const firstContainerG = first && PlaitElement.getContainerG(first, { suppressThrow: false });
                if (firstContainerG) {
                    parentG.insertBefore(g, firstContainerG);
                } else {
                    throw new Error('fail to mount container on moving');
                }
            } else {
                let parentElementG = PlaitElement.getElementG(parent);
                parentG.insertBefore(g, parentElementG);
            }
        }
    }
};

const mountOnItemMove = (
    element: PlaitElement,
    index: number,
    childrenContext: PlaitChildrenContext,
    currentIndexForFirstElement: number | null
) => {
    const containerG = PlaitElement.getContainerG(element, { suppressThrow: false });
    mountElementG(index, containerG, childrenContext, currentIndexForFirstElement);
    if (element.children && !PlaitElement.isRootElement(element)) {
        element.children.forEach((child, index) => {
            mountOnItemMove(child, index, { ...childrenContext, parent: element }, null);
        });
    }
};
