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

export const getNextMindElementByDirection = (board: PlaitBoard, source: MindElement, direction: Direction) => {
    const root = MindElement.getRoot(board, source);
    return getVisibleMindElements(board, root)
        .filter((element) => element !== source && isInNavigationDirection(direction, source, element))
        .sort((a, b) => {
            const overlapA = hasCrossAxisOverlap(direction, source, a);
            const overlapB = hasCrossAxisOverlap(direction, source, b);
            if (overlapA !== overlapB) {
                return overlapA ? -1 : 1;
            }
            const primaryDistance = getPrimaryDistance(direction, source, a) - getPrimaryDistance(direction, source, b);
            if (primaryDistance !== 0) {
                return primaryDistance;
            }
            return getSecondaryDistance(direction, source, a) - getSecondaryDistance(direction, source, b);
        })[0];
};
