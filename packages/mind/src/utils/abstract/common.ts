import { AbstractNode } from '@plait/layouts';
import { MindElement } from '../../interfaces/element';
import { PlaitBoard, PlaitElement, Transforms } from '@plait/core';
import { MindNodeComponent } from '../../node.component';
import { createMindElement, filterChildElement, findParentElement } from '../mindmap';
import { GRAY_COLOR } from '../../constants';

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
    const component = PlaitElement.getComponent(element) as MindNodeComponent;
    const parent = component.parent;

    if (!parent) return false;

    const elementIndex = parent.children.indexOf(component.node);

    return parent.children.some(child => {
        return AbstractNode.isAbstract(child.origin) && elementIndex >= child.origin.start! && elementIndex <= child.origin.end!;
    });
};

export const canSetAbstract = (element: PlaitElement) => {
    return !PlaitElement.isRootElement(element) && !AbstractNode.isAbstract(element) && !isSetAbstract(element);
};

export const setAbstract = (board: PlaitBoard, elements: PlaitElement[]) => {
    let elementGroup = filterChildElement(elements as MindElement[]);

    while (elementGroup.length) {
        const parent = findParentElement(elementGroup[0]);
        let abstractIncludedElements = elementGroup.filter(element => {
            return findParentElement(element) && parent === findParentElement(element);
        });

        const indexArray = abstractIncludedElements.map(child => parent!.children.indexOf(child)).sort((a, b) => a - b);
        const start = indexArray[0];
        const end = indexArray[indexArray.length - 1];
        const component = PlaitElement.getComponent(abstractIncludedElements[0]) as MindNodeComponent;
        const path = [...PlaitBoard.findPath(board, component.parent.origin), component.parent.children.length];

        const mindElement = createMindElement('概要', 28, 20, {
            strokeColor: GRAY_COLOR,
            linkLineColor: GRAY_COLOR
        });
        mindElement.start = start;
        mindElement.end = end;
        Transforms.insertNode(board, mindElement, path);

        elementGroup = elementGroup.filter(element => {
            return !findParentElement(element) || findParentElement(elementGroup[0]) !== findParentElement(element);
        });
    }
};
