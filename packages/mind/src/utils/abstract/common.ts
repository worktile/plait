import { AbstractNode, isStandardLayout } from '@plait/layouts';
import { MindElement } from '../../interfaces/element';
import { Path, PlaitBoard, PlaitElement, Transforms } from '@plait/core';
import { MindNodeComponent } from '../../node.component';
import { createMindElement, divideElementByParent, filterChildElement } from '../mind';
import { GRAY_COLOR } from '../../constants';
import { MindQueries } from '../../queries';

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
        strokeColor: GRAY_COLOR,
        linkLineColor: GRAY_COLOR
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

export const getCorrespondingAbstract = (element: MindElement) => {
    const parent = MindElement.getParent(element);
    if (!parent) return undefined;

    const elementIndex = parent.children.indexOf(element);
    return parent.children.find(child => {
        return AbstractNode.isAbstract(child) && elementIndex >= child.start! && elementIndex <= child.end!;
    });
};

export const getBehindAbstract = (element: MindElement) => {
    const parent = MindElement.getParent(element);
    const selectedElementIndex = parent.children.indexOf(element);
    return parent.children.filter(child => AbstractNode.isAbstract(child) && child.start! > selectedElementIndex);
};

export const insertSiblingElementHandleAbstract = (board: PlaitBoard, selectedElement: MindElement) => {
    const abstract = getCorrespondingAbstract(selectedElement);
    if (abstract) {
        PlaitBoard.findPath(board, abstract);
        Transforms.setNode(board, { end: abstract.end! + 1 }, PlaitBoard.findPath(board, abstract));
    }

    const abstracts = getBehindAbstract(selectedElement);
    if (abstracts.length) {
        moveAbstractPosition(board, abstracts, 1);
    }
};

export const moveAbstractPosition = (board: PlaitBoard, abstracts: MindElement[], step: number) => {
    abstracts.forEach(abstract => {
        Transforms.setNode(board, { start: abstract.start! + step, end: abstract.end! + step }, PlaitBoard.findPath(board, abstract));
    });
};
