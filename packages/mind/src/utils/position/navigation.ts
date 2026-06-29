import { Direction, PlaitBoard, RectangleClient, depthFirstRecursion, getIsRecursionFunc, isHorizontalDirection } from '@plait/core';
import { AbstractNode } from '@plait/layouts';
import { MindElement } from '../../interfaces';
import { getRectangleByNode } from './node';

export const getMindElementCenter = (element: MindElement) => {
    return RectangleClient.getCenterPoint(getRectangleByNode(MindElement.getNode(element)));
};

const isInNavigationDirection = (direction: Direction, source: MindElement, target: MindElement) => {
    const sourceCenter = getMindElementCenter(source);
    const targetCenter = getMindElementCenter(target);
    if (direction === Direction.left) {
        return targetCenter[0] < sourceCenter[0];
    }
    if (direction === Direction.right) {
        return targetCenter[0] > sourceCenter[0];
    }
    if (direction === Direction.top) {
        return targetCenter[1] < sourceCenter[1];
    }
    return targetCenter[1] > sourceCenter[1];
};

const hasCrossAxisOverlap = (direction: Direction, source: MindElement, target: MindElement) => {
    const sourceRectangle = getRectangleByNode(MindElement.getNode(source));
    const targetRectangle = getRectangleByNode(MindElement.getNode(target));
    if (isHorizontalDirection(direction)) {
        return RectangleClient.isHitY(sourceRectangle, targetRectangle);
    }
    return RectangleClient.isHitX(sourceRectangle, targetRectangle);
};

const getPrimaryDistance = (direction: Direction, source: MindElement, target: MindElement) => {
    const sourceCenter = getMindElementCenter(source);
    const targetCenter = getMindElementCenter(target);
    if (isHorizontalDirection(direction)) {
        return Math.abs(targetCenter[0] - sourceCenter[0]);
    }
    return Math.abs(targetCenter[1] - sourceCenter[1]);
};

const getSecondaryDistance = (direction: Direction, source: MindElement, target: MindElement) => {
    const sourceCenter = getMindElementCenter(source);
    const targetCenter = getMindElementCenter(target);
    if (isHorizontalDirection(direction)) {
        return Math.abs(targetCenter[1] - sourceCenter[1]);
    }
    return Math.abs(targetCenter[0] - sourceCenter[0]);
};

const getVisibleMindElements = (board: PlaitBoard, root: MindElement) => {
    const elements: MindElement[] = [];
    depthFirstRecursion<MindElement>(
        root,
        (node) => {
            if (!AbstractNode.isAbstract(node)) {
                elements.push(node);
            }
        },
        getIsRecursionFunc(board)
    );
    return elements;
};

const getVisibleChildren = (board: PlaitBoard, element: MindElement) => {
    if (!getIsRecursionFunc(board)(element)) {
        return [];
    }
    return element.children?.filter((child) => !AbstractNode.isAbstract(child)) || [];
};

const getVisibleParent = (element: MindElement) => {
    let parent = MindElement.findParent(element);
    while (parent && AbstractNode.isAbstract(parent)) {
        parent = MindElement.findParent(parent);
    }
    return parent;
};

const isInHorizontalDirection = (source: MindElement, target: MindElement, direction: Direction) => {
    const sourceCenter = getMindElementCenter(source);
    const targetCenter = getMindElementCenter(target);
    if (direction === Direction.left) {
        return targetCenter[0] < sourceCenter[0];
    }
    if (direction === Direction.right) {
        return targetCenter[0] > sourceCenter[0];
    }
    return false;
};

const getVisibleSiblingByDirection = (board: PlaitBoard, source: MindElement, direction: Direction) => {
    const parent = getVisibleParent(source);
    if (!parent) {
        return undefined;
    }
    const siblings = getVisibleChildren(board, parent);
    const sourceIndex = siblings.indexOf(source);
    if (sourceIndex === -1) {
        return undefined;
    }
    if (direction === Direction.top) {
        return siblings[sourceIndex - 1];
    }
    if (direction === Direction.bottom) {
        return siblings[sourceIndex + 1];
    }
    return undefined;
};

const getParentOrChildByHorizontalDirection = (
    board: PlaitBoard,
    source: MindElement,
    direction: Direction,
    previousElement?: MindElement
) => {
    const parent = getVisibleParent(source);
    if (parent && isInHorizontalDirection(source, parent, direction)) {
        return parent;
    }
    const children = getVisibleChildren(board, source);
    if (previousElement && children.includes(previousElement) && isInHorizontalDirection(source, previousElement, direction)) {
        return previousElement;
    }
    return children.find((child) => isInHorizontalDirection(source, child, direction));
};

const getNextMindElementByStructure = (board: PlaitBoard, source: MindElement, direction: Direction, previousElement?: MindElement) => {
    if (direction === Direction.left || direction === Direction.right) {
        return getParentOrChildByHorizontalDirection(board, source, direction, previousElement);
    }
    return getVisibleSiblingByDirection(board, source, direction);
};

const getNextMindElementByGeometry = (board: PlaitBoard, source: MindElement, direction: Direction) => {
    const root = MindElement.getRoot(board, source);
    return getVisibleMindElements(board, root)
        .filter(
            (element) =>
                element !== source &&
                isInNavigationDirection(direction, source, element) &&
                hasCrossAxisOverlap(direction, source, element)
        )
        .sort((a, b) => {
            const primaryDistance = getPrimaryDistance(direction, source, a) - getPrimaryDistance(direction, source, b);
            if (primaryDistance !== 0) {
                return primaryDistance;
            }
            return getSecondaryDistance(direction, source, a) - getSecondaryDistance(direction, source, b);
        })[0];
};

export const getNextMindElementByDirection = (
    board: PlaitBoard,
    source: MindElement,
    direction: Direction,
    previousElement?: MindElement
) => {
    return (
        getNextMindElementByStructure(board, source, direction, previousElement) || getNextMindElementByGeometry(board, source, direction)
    );
};
