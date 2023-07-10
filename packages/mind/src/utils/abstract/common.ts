import { AbstractNode } from '@plait/layouts';
import { MindElement, PlaitMind } from '../../interfaces/element';
import { Path, PlaitBoard, PlaitElement, PlaitNode } from '@plait/core';

export const separateChildren = (parentElement: MindElement) => {
    const rightNodeCount = parentElement.rightNodeCount!;
    const children = parentElement.children;
    let rightChildren = [],
        leftChildren = [];

    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (AbstractNode.isAbstract(child) && child.end < rightNodeCount) {
            rightChildren.push(child);
            continue;
        }
        if (AbstractNode.isAbstract(child) && child.start >= rightNodeCount) {
            leftChildren.push(child);
            continue;
        }

        if (i < rightNodeCount) {
            rightChildren.push(child);
        } else {
            leftChildren.push(child);
        }
    }

    return { leftChildren, rightChildren };
};

export const isSetAbstract = (element: PlaitElement) => {
    return !!getCorrespondingAbstract(element as MindElement);
};

export const canSetAbstract = (element: PlaitElement) => {
    return !PlaitElement.isRootElement(element) && !AbstractNode.isAbstract(element) && !isSetAbstract(element);
};

export const getCorrespondingAbstract = (element: MindElement) => {
    const parent = MindElement.findParent(element as MindElement);
    if (!parent) return undefined;

    const elementIndex = parent.children.indexOf(element);
    return parent.children.find(child => {
        return AbstractNode.isAbstract(child) && elementIndex >= child.start! && elementIndex <= child.end!;
    });
};

export const getBehindAbstracts = (element: MindElement) => {
    const parent = MindElement.findParent(element as MindElement);
    if (!parent) return [];
    const index = parent.children.indexOf(element);
    return parent.children.filter(child => AbstractNode.isAbstract(child) && child.start! > index);
};

/**
 * return corresponding abstract that is not child of elements
 */
export const getOverallAbstracts = (board: PlaitBoard, elements: MindElement[]) => {
    const overallAbstracts: MindElement[] = [];
    elements
        .filter(value => !AbstractNode.isAbstract(value) && !PlaitMind.isMind(value))
        .forEach(value => {
            const abstract = getCorrespondingAbstract(value);
            if (abstract && elements.indexOf(abstract) === -1 && overallAbstracts.indexOf(abstract) === -1) {
                const { start, end } = abstract;
                const parent = MindElement.getParent(value);
                const isOverall = parent.children.slice(start!, end! + 1).every(includedElement => elements.indexOf(includedElement) > -1);
                if (isOverall) {
                    overallAbstracts.push(abstract);
                }
            }
        });
    return overallAbstracts as (MindElement & AbstractNode)[];
};

export interface AbstractRef {
    abstract: MindElement & AbstractNode;
    references: MindElement[];
}

/**
 * abstract node is valid when elements contains at least one element it is referenced with
 */
export const getValidAbstractRefs = (board: PlaitBoard, elements: MindElement[]) => {
    const validAbstractRefs: AbstractRef[] = [];
    elements
        .filter(value => !AbstractNode.isAbstract(value) && !PlaitMind.isMind(value))
        .forEach(value => {
            const abstract = getCorrespondingAbstract(value);
            if (abstract && elements.indexOf(abstract) > 0) {
                const index = validAbstractRefs.findIndex(value => value.abstract === abstract);
                if (index === -1) {
                    validAbstractRefs.push({
                        abstract: abstract as MindElement & AbstractNode,
                        references: [value]
                    });
                } else {
                    validAbstractRefs[index].references.push(value);
                }
            }
        });
    return validAbstractRefs;
};

export function getRelativeStartEndByAbstractRef(abstractRef: AbstractRef, elements: MindElement[]) {
    const start = elements.indexOf(abstractRef.references[0]);
    const end = elements.indexOf(abstractRef.references[abstractRef.references.length - 1]);
    return { start, end };
}

export const insertElementHandleAbstract = (
    board: PlaitBoard,
    path: Path,
    step = 1,
    //由此区分拖拽和新增到概要概括最后一个节点
    isExtendPreviousNode: boolean = true,
    effectedAbstracts = new Map<MindElement, Pick<AbstractNode, 'start' | 'end'>>()
) => {
    const parent = PlaitNode.parent(board, path) as MindElement;
    const hasPreviousNode = path[path.length - 1] !== 0;
    let behindAbstracts: MindElement[];

    if (!hasPreviousNode) {
        behindAbstracts = parent.children.filter(child => AbstractNode.isAbstract(child));
    } else {
        const selectedElement = PlaitNode.get(board, Path.previous(path)) as MindElement;
        behindAbstracts = getBehindAbstracts(selectedElement);
    }

    if (behindAbstracts.length) {
        behindAbstracts.forEach(abstract => {
            let newProperties = effectedAbstracts.get(abstract);
            if (!newProperties) {
                newProperties = { start: 0, end: 0 };
                effectedAbstracts.set(abstract, newProperties);
            }
            newProperties.start = newProperties.start + step;
            newProperties.end = newProperties.end + step;
        });
    }

    if (!hasPreviousNode) {
        return effectedAbstracts;
    }

    const selectedElement = PlaitNode.get(board, Path.previous(path)) as MindElement;
    const correspondingAbstract = getCorrespondingAbstract(selectedElement);
    const isDragToLast = !isExtendPreviousNode && correspondingAbstract && correspondingAbstract.end === path[path.length - 1] - 1;

    if (correspondingAbstract && !isDragToLast) {
        let newProperties = effectedAbstracts.get(correspondingAbstract);
        if (!newProperties) {
            newProperties = { start: 0, end: 0 };
            effectedAbstracts.set(correspondingAbstract, newProperties);
        }
        newProperties.end = newProperties.end + step;
    }

    return effectedAbstracts;
};

export const deleteElementHandleAbstract = (
    board: PlaitBoard,
    deletableElements: MindElement[],
    effectedAbstracts = new Map<MindElement, Pick<AbstractNode, 'start' | 'end'>>()
) => {
    deletableElements.forEach(node => {
        if (!PlaitMind.isMind(node)) {
            const behindAbstracts = getBehindAbstracts(node).filter(abstract => !deletableElements.includes(abstract));
            if (behindAbstracts.length) {
                behindAbstracts.forEach(abstract => {
                    let newProperties = effectedAbstracts.get(abstract);
                    if (!newProperties) {
                        newProperties = { start: 0, end: 0 };
                        effectedAbstracts.set(abstract, newProperties);
                    }
                    newProperties.start = newProperties.start - 1;
                    newProperties.end = newProperties.end - 1;
                });
            }

            const correspondingAbstract = getCorrespondingAbstract(node);
            if (correspondingAbstract && !deletableElements.includes(correspondingAbstract)) {
                let newProperties = effectedAbstracts.get(correspondingAbstract);
                if (!newProperties) {
                    newProperties = { start: 0, end: 0 };

                    effectedAbstracts.set(correspondingAbstract, newProperties);
                }
                newProperties.end = newProperties.end - 1;
            }
        }
    });
    return effectedAbstracts;
};

export const isChildOfAbstract = (board: PlaitBoard, element: MindElement) => {
    const ancestors = MindElement.getAncestors(board, element) as MindElement[];
    return !!ancestors.find((value) => AbstractNode.isAbstract(value));
}