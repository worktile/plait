import { Path, PlaitBoard, PlaitElement, Transforms } from '@plait/core';
import { AbstractRefs } from '../plugins/with-abstract-resize.board';
import { MindElement } from '../interfaces/element';
import { AbstractNode, isStandardLayout } from '@plait/layouts';
import { divideElementByParent, getFirstLevelElement } from '../utils/mind';
import { MindQueries } from '../queries';
import { DefaultAbstractNodeStyle } from '../constants/node-style';
import { createMindElement } from '../utils/node/node-create';

export const setAbstractsByRefs = (board: PlaitBoard, abstractRefs: AbstractRefs) => {
    abstractRefs.forEach((newProperty, element) => {
        const start = element.start! + newProperty.start;
        const end = element.end! + newProperty.end;
        const path = PlaitBoard.findPath(board, element as MindElement);

        if (start > end) {
            Transforms.removeNode(board, path);
        } else {
            Transforms.setNode(board, { start, end }, path);
        }
    });
};

export const setAbstractByStandardLayout = (board: PlaitBoard, element: MindElement) => {
    const rightNodeCount = element.rightNodeCount!;
    const abstract = element.children.find(child => {
        return AbstractNode.isAbstract(child) && child.end >= rightNodeCount && child.start < rightNodeCount;
    });

    if (abstract) {
        const path = PlaitBoard.findPath(board, abstract);
        Transforms.setNode(board, { end: rightNodeCount - 1 }, path);
    }
};

export const insertAbstract = (board: PlaitBoard, elements: PlaitElement[]) => {
    let elementGroup = getFirstLevelElement(elements as MindElement[]);
    const { parentElements, abstractIncludedGroups } = divideElementByParent(elementGroup);

    abstractIncludedGroups.forEach((group, index) => {
        const groupParent = parentElements[index];
        setAbstractByElements(board, groupParent, group);
    });
};

const setAbstractByElements = (board: PlaitBoard, groupParent: MindElement, group: MindElement[]) => {
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

const insertAbstractNode = (board: PlaitBoard, path: Path, start: number, end: number) => {
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
