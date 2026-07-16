import { Direction, PlaitBoard, RectangleClient, depthFirstRecursion, getIsRecursionFunc, isHorizontalDirection } from '@plait/core';
import { AbstractNode } from '@plait/layouts';
import { LayoutDirection, MindElement } from '../../interfaces';
import { getLayoutReverseDirection } from '../layout';
import { resolveLayoutRelationDirection } from './layout-direction';
import { getRectangleByNode } from './node';

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

const isInSameNavigationLane = (direction: Direction, source: MindElement, target: MindElement) => {
    const sourceRectangle = getRectangleByNode(MindElement.getNode(source));
    const targetRectangle = getRectangleByNode(MindElement.getNode(target));
    if (isHorizontalDirection(direction)) {
        return RectangleClient.isHitY(sourceRectangle, targetRectangle);
    }
    return RectangleClient.isHitX(sourceRectangle, targetRectangle);
};

const getDistanceInNavigationDirection = (direction: Direction, source: MindElement, target: MindElement) => {
    const sourceCenter = getMindElementCenter(source);
    const targetCenter = getMindElementCenter(target);
    if (isHorizontalDirection(direction)) {
        return Math.abs(targetCenter[0] - sourceCenter[0]);
    }
    return Math.abs(targetCenter[1] - sourceCenter[1]);
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

type LayoutNavigationRelation = 'parent' | 'child' | 'previous-sibling' | 'next-sibling';

interface LayoutNavigationCandidate {
    element: MindElement;
    relation: LayoutNavigationRelation;
    direction: LayoutDirection;
}

const getLayoutNavigationCandidates = (board: PlaitBoard, source: MindElement): LayoutNavigationCandidate[] => {
    const candidates: LayoutNavigationCandidate[] = [];
    const parent = getVisibleParent(source);

    if (parent) {
        const incomingDirection = resolveLayoutRelationDirection(board, {
            type: 'parent-child',
            parent,
            child: source
        });
        candidates.push({
            element: parent,
            relation: 'parent',
            direction: getLayoutReverseDirection(incomingDirection)
        });
    }

    getVisibleChildren(board, source).forEach((child) => {
        candidates.push({
            element: child,
            relation: 'child',
            direction: resolveLayoutRelationDirection(board, {
                type: 'parent-child',
                parent: source,
                child
            })
        });
    });

    if (parent) {
        const siblings = getVisibleChildren(board, parent);
        const sourceIndex = siblings.indexOf(source);
        if (sourceIndex !== -1) {
            const previousSibling = siblings[sourceIndex - 1];
            const nextSibling = siblings[sourceIndex + 1];

            if (previousSibling) {
                candidates.push({
                    element: previousSibling,
                    relation: 'previous-sibling',
                    direction: resolveLayoutRelationDirection(board, {
                        type: 'sibling',
                        parent,
                        order: 'previous'
                    })
                });
            }

            if (nextSibling) {
                candidates.push({
                    element: nextSibling,
                    relation: 'next-sibling',
                    direction: resolveLayoutRelationDirection(board, {
                        type: 'sibling',
                        parent,
                        order: 'next'
                    })
                });
            }
        }
    }

    return candidates;
};

const resolveLayoutNavigationTarget = (
    candidates: LayoutNavigationCandidate[],
    direction: LayoutDirection,
    previousElement?: MindElement
) => {
    const matches = candidates.filter((candidate) => candidate.direction === direction);
    const sibling = matches.find((candidate) => candidate.relation === 'previous-sibling' || candidate.relation === 'next-sibling');
    if (sibling) {
        return sibling.element;
    }

    const parent = matches.find((candidate) => candidate.relation === 'parent');
    if (parent) {
        return parent.element;
    }

    const children = matches.filter((candidate) => candidate.relation === 'child');
    const rememberedChild = children.find((candidate) => candidate.element === previousElement);
    return rememberedChild?.element || children[0]?.element;
};

const getNextMindElementByGeometry = (board: PlaitBoard, source: MindElement, direction: Direction) => {
    const root = MindElement.getRoot(board, source);
    return getVisibleMindElements(board, root)
        .filter(
            (element) =>
                element !== source &&
                isInNavigationDirection(direction, source, element) &&
                isInSameNavigationLane(direction, source, element)
        )
        .sort((a, b) => getDistanceInNavigationDirection(direction, source, a) - getDistanceInNavigationDirection(direction, source, b))[0];
};

export const getNextMindElementByDirection = (
    board: PlaitBoard,
    source: MindElement,
    direction: Direction,
    previousElement?: MindElement
) => {
    const layoutDirection = DirectionToLayoutDirection[direction];
    const candidates = getLayoutNavigationCandidates(board, source);
    const layoutTarget = resolveLayoutNavigationTarget(candidates, layoutDirection, previousElement);

    return layoutTarget || getNextMindElementByGeometry(board, source, direction);
};
