import {
    PlaitBoard,
    RectangleClient,
    Transforms,
    cacheSelectedElements,
    depthFirstRecursion,
    getIsRecursionFunc,
    getSelectedElements
} from '@plait/core';
import { MindElement, PlaitMind } from '../interfaces';
import { AbstractNode } from '@plait/layouts';
import { MindTransforms } from '../transforms';
import { editTopic } from '../utils/node/common';
import { PlaitMindBoard } from './with-mind.board';
import { isSpaceHotkey, isExpandHotkey, isTabHotkey, isEnterHotkey, isVirtualKey, isDelete, getFirstTextManage } from '@plait/common';
import { isHotkey } from 'is-hotkey';
import { getRectangleByNode } from '../utils/position/node';

type NavigationDirection = 'left' | 'right' | 'up' | 'down';

const getNavigationDirection = (event: KeyboardEvent): NavigationDirection | null => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
        return null;
    }
    switch (event.key) {
        case 'ArrowLeft':
            return 'left';
        case 'ArrowRight':
            return 'right';
        case 'ArrowUp':
            return 'up';
        case 'ArrowDown':
            return 'down';
        default:
            return null;
    }
};

const getElementCenter = (element: MindElement) => {
    return RectangleClient.getCenterPoint(getRectangleByNode(MindElement.getNode(element)));
};

const isInNavigationDirection = (direction: NavigationDirection, source: MindElement, target: MindElement) => {
    const sourceCenter = getElementCenter(source);
    const targetCenter = getElementCenter(target);
    if (direction === 'left') {
        return targetCenter[0] < sourceCenter[0];
    }
    if (direction === 'right') {
        return targetCenter[0] > sourceCenter[0];
    }
    if (direction === 'up') {
        return targetCenter[1] < sourceCenter[1];
    }
    return targetCenter[1] > sourceCenter[1];
};

const hasCrossAxisOverlap = (direction: NavigationDirection, source: MindElement, target: MindElement) => {
    const sourceRectangle = getRectangleByNode(MindElement.getNode(source));
    const targetRectangle = getRectangleByNode(MindElement.getNode(target));
    if (direction === 'left' || direction === 'right') {
        return (
            sourceRectangle.y <= targetRectangle.y + targetRectangle.height &&
            targetRectangle.y <= sourceRectangle.y + sourceRectangle.height
        );
    }
    return sourceRectangle.x <= targetRectangle.x + targetRectangle.width && targetRectangle.x <= sourceRectangle.x + sourceRectangle.width;
};

const getPrimaryDistance = (direction: NavigationDirection, source: MindElement, target: MindElement) => {
    const sourceCenter = getElementCenter(source);
    const targetCenter = getElementCenter(target);
    if (direction === 'left' || direction === 'right') {
        return Math.abs(targetCenter[0] - sourceCenter[0]);
    }
    return Math.abs(targetCenter[1] - sourceCenter[1]);
};

const getSecondaryDistance = (direction: NavigationDirection, source: MindElement, target: MindElement) => {
    const sourceCenter = getElementCenter(source);
    const targetCenter = getElementCenter(target);
    if (direction === 'left' || direction === 'right') {
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

const getNextMindElementByDirection = (board: PlaitBoard, source: MindElement, direction: NavigationDirection) => {
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

const selectMindElement = (board: PlaitBoard, element: MindElement) => {
    cacheSelectedElements(board, [element]);
    const center = getElementCenter(element);
    Transforms.setSelection(board, { anchor: center, focus: center });
};

export const withMindHotkey = (baseBoard: PlaitBoard) => {
    const board = baseBoard as PlaitBoard & PlaitMindBoard;
    const { keyDown, globalKeyDown } = board;

    board.keyDown = (event: KeyboardEvent) => {
        const selectedElements = getSelectedElements(board);
        const isSingleSelection = selectedElements.length === 1;
        const isSingleMindElement = selectedElements.length === 1 && MindElement.isMindElement(board, selectedElements[0]);
        const targetElement = selectedElements[0] as MindElement;

        if (isExpandHotkey(event) && isSingleMindElement && !PlaitMind.isMind(targetElement)) {
            if (targetElement.children && targetElement.children.length > 0) {
                Transforms.setNode(
                    board,
                    { isCollapsed: targetElement.isCollapsed ? false : true },
                    PlaitBoard.findPath(board, targetElement)
                );
                return;
            }
        }

        const navigationDirection = getNavigationDirection(event);
        if (navigationDirection && isSingleMindElement && !PlaitBoard.hasBeenTextEditing(board)) {
            const nextElement = getNextMindElementByDirection(board, targetElement, navigationDirection);
            if (nextElement) {
                event.preventDefault();
                selectMindElement(board, nextElement);
                return;
            }
        }

        if (!PlaitBoard.isReadonly(board)) {
            if (isTabHotkey(event) && isSingleMindElement) {
                event.preventDefault();
                MindTransforms.insertChildNode(board, targetElement);
                return;
            }

            if (
                isEnterHotkey(event) &&
                isSingleMindElement &&
                !PlaitMind.isMind(targetElement) &&
                !AbstractNode.isAbstract(targetElement)
            ) {
                MindTransforms.insertSiblingNode(board, targetElement);
                return;
            }

            if (
                !isVirtualKey(event) &&
                !isDelete(event) &&
                !isSpaceHotkey(event) &&
                isSingleSelection &&
                MindElement.isMindElement(board, targetElement)
            ) {
                event.preventDefault();
                editTopic(targetElement);
                return;
            }
        }

        keyDown(event);
    };

    board.globalKeyDown = (event: KeyboardEvent) => {
        if (PlaitBoard.isFocus(board) && PlaitBoard.hasBeenTextEditing(board)) {
            if (isHotkey('mod+z', event)) {
                const { history } = board;
                const { undos } = history;
                const previousOp = undos.length > 0 ? undos[undos.length - 1][0] : undefined;
                if (
                    previousOp &&
                    previousOp.type === 'insert_node' &&
                    MindElement.isMindElement(board, previousOp.node) &&
                    getFirstTextManage(previousOp.node).isEditing
                ) {
                    board.undo();
                }
            }
        }
        globalKeyDown(event);
    };

    return board;
};
