import { AbstractNode, isStandardLayout } from '@plait/layouts';
import { MindElement, PlaitMind } from '../../interfaces/element';
import { Path, PlaitBoard, PlaitElement, PlaitNode, Transforms } from '@plait/core';
import { createMindElement, divideElementByParent, filterChildElement } from '../mind';
import { MindQueries } from '../../queries';
import { DefaultAbstractNodeStyle } from '../../constants/node-style';

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
    const parent = MindElement.getParent(element as MindElement);
    return !!getCorrespondingAbstract(parent, element as MindElement);
};

export const canSetAbstract = (element: PlaitElement) => {
    return !PlaitElement.isRootElement(element) && !AbstractNode.isAbstract(element) && !isSetAbstract(element);
};

export const setAbstract = (board: PlaitBoard, elements: PlaitElement[]) => {
    let elementGroup = filterChildElement(elements as MindElement[]);
    const { parentElements, abstractIncludedGroups } = divideElementByParent(elementGroup);

    abstractIncludedGroups.forEach((group, index) => {
        const groupParent = parentElements[index];
        setAbstractByElements(board, groupParent, group);
    });
};

export const setAbstractByElements = (board: PlaitBoard, groupParent: MindElement, group: MindElement[]) => {
    const indexArray = group.map(child => groupParent!.children.indexOf(child)).sort((a, b) => a - b);
    const rightNodeCount = groupParent?.rightNodeCount;
    const start = indexArray[0],
        end = indexArray[indexArray.length - 1];

    if (
        isStandardLayout(MindQueries.getLayoutByElement(groupParent)) &&
        rightNodeCount &&
        start < rightNodeCount &&
        end >= rightNodeCount
    ) {
        const childrenLength = groupParent.children.length;
        const path = [...PlaitBoard.findPath(board, groupParent), childrenLength];
        const leftChildren = indexArray.filter(index => index >= rightNodeCount);
        const rightChildren = indexArray.filter(index => index < rightNodeCount);

        insertAbstractNode(board, path, rightChildren[0], rightChildren[rightChildren.length - 1]);
        insertAbstractNode(board, Path.next(path), leftChildren[0], leftChildren[leftChildren.length - 1]);
    } else {
        const path = [...PlaitBoard.findPath(board, groupParent), groupParent.children.length];

        insertAbstractNode(board, path, start, end);
    }
};

export const insertAbstractNode = (board: PlaitBoard, path: Path, start: number, end: number) => {
    const mindElement = createMindElement('概要', 28, 20, {
        strokeColor: DefaultAbstractNodeStyle.strokeColor,
        strokeWidth: DefaultAbstractNodeStyle.branchWidth,
        branchColor: DefaultAbstractNodeStyle.branchColor,
        branchWidth: DefaultAbstractNodeStyle.branchWidth
    });

    mindElement.start = start;
    mindElement.end = end;

    Transforms.insertNode(board, mindElement, path);
};

export const handleAbstractIncluded = (board: PlaitBoard, element: MindElement) => {
    const rightNodeCount = element.rightNodeCount!;
    const abstract = element.children.find(child => {
        return AbstractNode.isAbstract(child) && child.end >= rightNodeCount && child.start < rightNodeCount;
    });

    if (abstract) {
        const path = PlaitBoard.findPath(board, abstract);
        Transforms.setNode(board, { end: rightNodeCount - 1 }, path);
    }
};

export const getCorrespondingAbstract = (parent: MindElement, element: MindElement) => {
    if (!parent) return undefined;

    const elementIndex = parent.children.indexOf(element);
    return parent.children.find(child => {
        return AbstractNode.isAbstract(child) && elementIndex >= child.start! && elementIndex <= child.end!;
    });
};

export const getBehindAbstracts = (parent: MindElement, element: MindElement) => {
    const index = parent.children.indexOf(element);
    return parent.children.filter(child => AbstractNode.isAbstract(child) && child.start! > index);
};

export const getOverallAbstracts = (board: PlaitBoard, elements: MindElement[]) => {
    const overallAbstracts: MindElement[] = [];
    elements
        .filter(value => !AbstractNode.isAbstract(value))
        .forEach(value => {
            const parent = MindElement.getParent(value);
            const abstract = getCorrespondingAbstract(parent, value);
            if (abstract && overallAbstracts.indexOf(abstract) === -1) {
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

export const insertElementHandleAbstract = (
    board: PlaitBoard,
    path: Path,
    //由此区分拖拽和新增到概要概括最后一个节点
    isExtendPreviousNode: boolean = true,
    abstractRefs = new Map<MindElement, Pick<AbstractNode, 'start' | 'end'>>()
) => {
    const parent = PlaitNode.parent(board, path) as MindElement;
    const hasPreviousNode = path[path.length - 1] !== 0;
    let behindAbstracts: MindElement[];

    if (!hasPreviousNode) {
        behindAbstracts = parent.children.filter(child => AbstractNode.isAbstract(child));
    } else {
        const selectedElement = PlaitNode.get(board, Path.previous(path)) as MindElement;
        behindAbstracts = getBehindAbstracts(parent, selectedElement);
    }

    if (behindAbstracts.length) {
        behindAbstracts.forEach(abstract => {
            let newProperties = abstractRefs.get(abstract);
            if (!newProperties) {
                newProperties = { start: 0, end: 0 };
                abstractRefs.set(abstract, newProperties);
            }
            newProperties.start = newProperties.start + 1;
            newProperties.end = newProperties.end + 1;
        });
    }

    if (!hasPreviousNode) {
        return abstractRefs;
    }

    const selectedElement = PlaitNode.get(board, Path.previous(path)) as MindElement;
    const correspondingAbstract = getCorrespondingAbstract(parent, selectedElement);
    const isDragToLast = !isExtendPreviousNode && correspondingAbstract && correspondingAbstract.end === path[path.length - 1] - 1;

    if (correspondingAbstract && !isDragToLast) {
        let newProperties = abstractRefs.get(correspondingAbstract);
        if (!newProperties) {
            newProperties = { start: 0, end: 0 };
            abstractRefs.set(correspondingAbstract, newProperties);
        }
        newProperties.end = newProperties.end + 1;
    }

    return abstractRefs;
};

export const deleteElementHandleAbstract = (
    board: PlaitBoard,
    deletableElements: MindElement[],
    abstractRefs = new Map<MindElement, Pick<AbstractNode, 'start' | 'end'>>()
) => {
    deletableElements.forEach(node => {
        if (!PlaitMind.isMind(node)) {
            const parent = PlaitNode.parent(board, PlaitBoard.findPath(board, node)) as MindElement;

            const behindAbstracts = getBehindAbstracts(parent, node).filter(abstract => !deletableElements.includes(abstract));
            if (behindAbstracts.length) {
                behindAbstracts.forEach(abstract => {
                    let newProperties = abstractRefs.get(abstract);
                    if (!newProperties) {
                        newProperties = { start: 0, end: 0 };
                        abstractRefs.set(abstract, newProperties);
                    }
                    newProperties.start = newProperties.start - 1;
                    newProperties.end = newProperties.end - 1;
                });
            }

            const correspondingAbstract = getCorrespondingAbstract(parent, node);
            if (correspondingAbstract && !deletableElements.includes(correspondingAbstract)) {
                let newProperties = abstractRefs.get(correspondingAbstract);
                if (!newProperties) {
                    newProperties = { start: 0, end: 0 };

                    abstractRefs.set(correspondingAbstract, newProperties);
                }
                newProperties.end = newProperties.end - 1;
            }
        }
    });
    return abstractRefs;
};

export const moveAbstractPosition = (board: PlaitBoard, abstracts: MindElement[], step: number) => {
    abstracts.forEach(abstract => {
        Transforms.setNode(board, { start: abstract.start! + step, end: abstract.end! + step }, PlaitBoard.findPath(board, abstract));
    });
};
