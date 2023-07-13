import {
    Path,
    PlaitBoard,
    PlaitHistoryBoard,
    PlaitNode,
    Transforms,
    addSelectedElement,
    getSelectedElements,
    hotkeys,
    removeSelectedElement
} from '@plait/core';
import { MindElement, PlaitMind } from '../interfaces';
import { isKeyHotkey } from 'is-hotkey';
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
import { isVirtualKey } from '../utils/is-virtual-key';
import { editTopic } from '../utils/node/common';

export const withMindHotkey = (board: PlaitBoard) => {
    const { keydown } = board;

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

            if (
                selectedElements.length > 0 &&
                !event.defaultPrevented &&
                (hotkeys.isDeleteBackward(event) || hotkeys.isDeleteForward(event))
            ) {
                event.preventDefault();
                const targetMindElements = selectedElements.filter(el => MindElement.isMindElement(board, el)) as MindElement[];
                const firstLevelElements = getFirstLevelElement(targetMindElements);

                if (firstLevelElements.length > 0) {
                    const deletableElements = [...firstLevelElements].reverse();
                    const abstractRefs = deleteElementHandleAbstract(board, deletableElements);
                    MindTransforms.setAbstractsByRefs(board, abstractRefs);

                    const refs = deleteElementsHandleRightNodeCount(board, targetMindElements);
                    MindTransforms.setRightNodeCountByRefs(board, refs);

                    MindTransforms.removeElements(board, targetMindElements);

                    const nextSelected = getNextSelectedElement(board, firstLevelElements);
                    if (nextSelected) {
                        addSelectedElement(board, nextSelected);
                    }
                }
                return;
            }

            if (!isVirtualKey(event) && !isSpaceHotkey(event) && isSingleSelection) {
                event.preventDefault();
                editTopic(targetElement);
                return;
            }
        }

        keydown(event);
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

export const isExpandHotkey = (event: KeyboardEvent) => {
    return isKeyHotkey('mod+/', event);
};

export const isTabHotkey = (event: KeyboardEvent) => {
    return event.key === 'Tab';
};

export const isEnterHotkey = (event: KeyboardEvent) => {
    return event.key === 'Enter';
};

export const isSpaceHotkey = (event: KeyboardEvent) => {
    return event.code === 'Space';
};
