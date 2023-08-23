import {
    Path,
    PlaitBoard,
    PlaitHistoryBoard,
    PlaitNode,
    Transforms,
    addSelectedElement,
    getSelectedElements,
    removeSelectedElement
} from '@plait/core';
import { MindElement, PlaitMind } from '../interfaces';
import { AbstractNode } from '@plait/layouts';
import { getFirstLevelElement, insertMindElement } from '../utils/mind';
import { findNewChildNodePath, findNewSiblingNodePath } from '../utils/path';
import {
    deleteElementsHandleRightNodeCount,
    insertElementHandleRightNodeCount,
    isInRightBranchOfStandardLayout
} from '../utils/node/right-node-count';
import { MindTransforms } from '../transforms';
import { deleteElementHandleAbstract, insertElementHandleAbstract } from '../utils/abstract/common';
import { editTopic, getSelectedMindElements } from '../utils/node/common';
import { PlaitMindBoard } from './with-mind.board';
import { isSpaceHotkey, isExpandHotkey, isTabHotkey, isEnterHotkey, isVirtualKey } from '@plait/common';

export const withMindHotkey = (baseBoard: PlaitBoard) => {
    const board = baseBoard as PlaitBoard & PlaitMindBoard;
    const { keydown, deleteFragment } = board;

    board.keydown = (event: KeyboardEvent) => {
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

        if (!PlaitBoard.isReadonly(board)) {
            if (isTabHotkey(event) && isSingleMindElement) {
                event.preventDefault();
                removeSelectedElement(board, targetElement);
                const targetElementPath = PlaitBoard.findPath(board, targetElement);
                if (targetElement.isCollapsed) {
                    const newElement: Partial<MindElement> = { isCollapsed: false };
                    PlaitHistoryBoard.withoutSaving(board, () => {
                        Transforms.setNode(board, newElement, targetElementPath);
                    });
                }
                insertMindElement(board, targetElement, findNewChildNodePath(board, targetElement));
                return;
            }

            if (
                isEnterHotkey(event) &&
                isSingleMindElement &&
                !PlaitMind.isMind(targetElement) &&
                !AbstractNode.isAbstract(targetElement)
            ) {
                const targetElementPath = PlaitBoard.findPath(board, targetElement);
                if (isInRightBranchOfStandardLayout(targetElement)) {
                    const refs = insertElementHandleRightNodeCount(board, targetElementPath.slice(0, 1), 1);
                    MindTransforms.setRightNodeCountByRefs(board, refs);
                }
                const abstractRefs = insertElementHandleAbstract(board, Path.next(targetElementPath));
                MindTransforms.setAbstractsByRefs(board, abstractRefs);
                insertMindElement(board, targetElement, findNewSiblingNodePath(board, targetElement));
                return;
            }

            if (!isVirtualKey(event) && !isSpaceHotkey(event) && isSingleSelection && PlaitMind.isMind(targetElement)) {
                event.preventDefault();
                editTopic(targetElement);
                return;
            }
        }

        keydown(event);
    };

    board.deleteFragment = (data: DataTransfer | null) => {
        const targetMindElements = getSelectedMindElements(board);
        if (targetMindElements.length) {
            const firstLevelElements = getFirstLevelElement(targetMindElements).reverse();
            const abstractRefs = deleteElementHandleAbstract(board, firstLevelElements);
            MindTransforms.setAbstractsByRefs(board, abstractRefs);

            const refs = deleteElementsHandleRightNodeCount(board, targetMindElements);
            MindTransforms.setRightNodeCountByRefs(board, refs);

            MindTransforms.removeElements(board, targetMindElements);

            const nextSelected = getNextSelectedElement(board, firstLevelElements);
            if (nextSelected) {
                addSelectedElement(board, nextSelected);
            }
        }
        deleteFragment(data);
    };

    return board;
};

export const getNextSelectedElement = (board: PlaitBoard, firstLevelElements: MindElement[]) => {
    let activeElement: MindElement | undefined;
    const firstLevelElement = firstLevelElements[0];
    const firstLevelElementPath = PlaitBoard.findPath(board, firstLevelElement);

    let nextSelectedPath = firstLevelElementPath;
    if (Path.hasPrevious(firstLevelElementPath)) {
        nextSelectedPath = Path.previous(firstLevelElementPath);
    }

    if (AbstractNode.isAbstract(firstLevelElement)) {
        const parent = MindElement.getParent(firstLevelElement);
        if (!firstLevelElements.includes(parent.children[firstLevelElement.start])) {
            activeElement = parent.children[firstLevelElement.start];
        }
    }

    try {
        if (!activeElement) {
            activeElement = PlaitNode.get<MindElement>(board, nextSelectedPath);
        }
    } catch (error) {}

    const firstElement = firstLevelElements[0];
    const firstElementParent = MindElement.findParent(firstElement);
    const hasSameParent = firstLevelElements.every(element => {
        return MindElement.findParent(element) === firstElementParent;
    });
    if (firstElementParent && hasSameParent && !activeElement) {
        activeElement = firstElementParent;
    }
    return activeElement;
};
