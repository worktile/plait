import {
    Path,
    PlaitBoard,
    PlaitHistoryBoard,
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
        if (isExpandHotkey(event)) {
            const selectedMindElements = getSelectedElements(board).filter(element =>
                MindElement.isMindElement(board, element)
            ) as MindElement[];
            if (
                selectedMindElements.length === 1 &&
                !PlaitMind.isMind(selectedMindElements[0]) &&
                selectedMindElements[0].children &&
                selectedMindElements[0].children.length > 0
            ) {
                const element = selectedMindElements[0];
                Transforms.setNode(board, { isCollapsed: element.isCollapsed ? false : true }, PlaitBoard.findPath(board, element));
                return;
            }
        }

        if (!PlaitBoard.isReadonly(board)) {
            const selectedElements = getSelectedElements(board) as MindElement[];
            const isSingleSelection = selectedElements.length === 1;
            const targetElement = selectedElements[0];

            if (isTabHotkey(event) && isSingleSelection) {
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

            if (isEnterHotkey(event) && isSingleSelection && !targetElement.isRoot && !AbstractNode.isAbstract(targetElement)) {
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

            if (selectedElements.length > 0 && (hotkeys.isDeleteBackward(event) || hotkeys.isDeleteForward(event))) {
                event.preventDefault();
                const deletableElements = getFirstLevelElement(selectedElements).reverse();
                const abstractRefs = deleteElementHandleAbstract(board, deletableElements);
                MindTransforms.setAbstractsByRefs(board, abstractRefs);

                const refs = deleteElementsHandleRightNodeCount(board, selectedElements);
                MindTransforms.setRightNodeCountByRefs(board, refs);

                MindTransforms.removeElements(board, selectedElements);

                let activeElement: MindElement | undefined;
                const firstLevelElements = getFirstLevelElement(selectedElements);

                if (AbstractNode.isAbstract(firstLevelElements[0])) {
                    const parent = MindElement.getParent(firstLevelElements[0]);
                    activeElement = parent.children[firstLevelElements[0].start];
                }

                const firstElement = firstLevelElements[0];
                const firstElementParent = MindElement.findParent(firstElement);
                const hasSameParent = firstLevelElements.every(element => {
                    return MindElement.findParent(element) === firstElementParent;
                });
                if (firstElementParent && hasSameParent && !activeElement) {
                    const firstElementIndex = firstElementParent.children.indexOf(firstElement);
                    const childrenCount = firstElementParent.children.length;
                    // active parent element
                    if (childrenCount === firstLevelElements.length) {
                        activeElement = firstElementParent;
                    } else {
                        if (firstElementIndex > 0) {
                            activeElement = firstElementParent.children[firstElementIndex - 1];
                        }
                    }
                }
                if (activeElement) {
                    addSelectedElement(board, activeElement);
                }
                return;
            }

            if (!isVirtualKey(event) && !isSpaceHotkey(event) && isSingleSelection) {
                event.preventDefault();
                const selectedElement = selectedElements[0];
                editTopic(selectedElement);
                return;
            }
        }

        keydown(event);
    };

    return board;
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
