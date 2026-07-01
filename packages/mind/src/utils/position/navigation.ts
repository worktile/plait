import { Direction, PlaitBoard, RectangleClient, depthFirstRecursion, getIsRecursionFunc, isHorizontalDirection } from '@plait/core';
import { AbstractNode, MindLayoutType, isHorizontalLayout, isIndentedLayout, isRightLayout, isTopLayout } from '@plait/layouts';
import { LayoutDirection, MindElement, PlaitMind } from '../../interfaces';
import { MindQueries } from '../../queries';
import { getLayoutDirection as getNodeLayoutDirection } from '../point-placement';
import { getLayoutReverseDirection } from '../layout';
import { getRectangleByNode } from './node';

const LayoutDirectionToDirection = {
    [LayoutDirection.left]: Direction.left,
    [LayoutDirection.right]: Direction.right,
    [LayoutDirection.top]: Direction.top,
    [LayoutDirection.bottom]: Direction.bottom
};

const DirectionToLayoutDirection = {
    [Direction.left]: LayoutDirection.left,
    [Direction.right]: LayoutDirection.right,
    [Direction.top]: LayoutDirection.top,
    [Direction.bottom]: LayoutDirection.bottom
};

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

const getVisibleDepth = (element: MindElement) => {
    let depth = 0;
    let parent = getVisibleParent(element);
    while (parent) {
        depth++;
        parent = getVisibleParent(parent);
    }
    return depth;
};

const getCorrectLayout = (board: PlaitBoard, element: MindElement) => {
    return MindQueries.getCorrectLayoutByElement(board, element) as MindLayoutType;
};

const getIndentedHierarchyLayoutDirection = (layout: MindLayoutType) => {
    return isRightLayout(layout) ? LayoutDirection.right : LayoutDirection.left;
};

const getIndentedBranchLayoutDirection = (layout: MindLayoutType) => {
    return isTopLayout(layout) ? LayoutDirection.top : LayoutDirection.bottom;
};

const getParentChildLayoutDirection = (board: PlaitBoard, element: MindElement) => {
    const node = MindElement.getNode(element);
    const layout = getCorrectLayout(board, element);
    if (isIndentedLayout(layout)) {
        return getIndentedHierarchyLayoutDirection(layout);
    }
    return getNodeLayoutDirection(node, isHorizontalLayout(layout));
};

const getChildLayoutDirection = (board: PlaitBoard, source: MindElement, child: MindElement) => {
    const layout = getCorrectLayout(board, child);
    if (PlaitMind.isMind(source) && isIndentedLayout(layout)) {
        return getIndentedBranchLayoutDirection(layout);
    }
    return getParentChildLayoutDirection(board, child);
};

const getVisibleSiblingByDirection = (board: PlaitBoard, source: MindElement, direction: Direction) => {
    const parent = getVisibleParent(source);
    if (!parent) {
        return undefined;
    }
    const layout = getCorrectLayout(board, source);
    const parentChildDirection = getParentChildLayoutDirection(board, source);
    const previousSiblingDirection = isIndentedLayout(layout)
        ? getLayoutReverseDirection(getIndentedBranchLayoutDirection(layout))
        : isHorizontalDirection(LayoutDirectionToDirection[parentChildDirection])
        ? LayoutDirection.top
        : LayoutDirection.left;
    const nextSiblingDirection = isIndentedLayout(layout)
        ? getIndentedBranchLayoutDirection(layout)
        : isHorizontalDirection(LayoutDirectionToDirection[parentChildDirection])
        ? LayoutDirection.bottom
        : LayoutDirection.right;
    if (
        direction !== LayoutDirectionToDirection[previousSiblingDirection] &&
        direction !== LayoutDirectionToDirection[nextSiblingDirection]
    ) {
        return undefined;
    }
    const sourceLayoutDirection = getChildLayoutDirection(board, parent, source);
    const siblings = getVisibleChildren(board, parent).filter(
        (sibling) => getChildLayoutDirection(board, parent, sibling) === sourceLayoutDirection
    );
    const sourceIndex = siblings.indexOf(source);
    if (sourceIndex === -1) {
        return undefined;
    }
    if (direction === LayoutDirectionToDirection[previousSiblingDirection]) {
        return siblings[sourceIndex - 1];
    }
    if (direction === LayoutDirectionToDirection[nextSiblingDirection]) {
        return siblings[sourceIndex + 1];
    }
    return undefined;
};

const getParentOrChildByLayoutDirection = (board: PlaitBoard, source: MindElement, direction: Direction, previousElement?: MindElement) => {
    const layoutDirection = DirectionToLayoutDirection[direction];
    const parent = getVisibleParent(source);
    if (parent && getLayoutReverseDirection(getChildLayoutDirection(board, parent, source)) === layoutDirection) {
        return parent;
    }
    const children = getVisibleChildren(board, source);
    if (
        previousElement &&
        children.includes(previousElement) &&
        getChildLayoutDirection(board, source, previousElement) === layoutDirection
    ) {
        return previousElement;
    }
    return children.find((child) => getChildLayoutDirection(board, source, child) === layoutDirection);
};

const getNextMindElementByStructure = (board: PlaitBoard, source: MindElement, direction: Direction, previousElement?: MindElement) => {
    return (
        getVisibleSiblingByDirection(board, source, direction) ||
        getParentOrChildByLayoutDirection(board, source, direction, previousElement)
    );
};

const getNextMindElementByGeometry = (board: PlaitBoard, source: MindElement, direction: Direction) => {
    if (isIndentedLayout(getCorrectLayout(board, source))) {
        return undefined;
    }
    const root = MindElement.getRoot(board, source);
    const sourceLayoutDirection = getParentChildLayoutDirection(board, source);
    const sourceDepth = getVisibleDepth(source);
    return getVisibleMindElements(board, root)
        .filter(
            (element) =>
                element !== source &&
                getVisibleDepth(element) === sourceDepth &&
                getParentChildLayoutDirection(board, element) === sourceLayoutDirection &&
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
