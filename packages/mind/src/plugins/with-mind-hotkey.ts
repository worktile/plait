import { Direction, PlaitBoard, Transforms, getSelectedElements } from '@plait/core';
import { MindElement, PlaitMind } from '../interfaces';
import { AbstractNode } from '@plait/layouts';
import { MindTransforms } from '../transforms';
import { editTopic } from '../utils/node/common';
import { PlaitMindBoard } from './with-mind.board';
import { isSpaceHotkey, isExpandHotkey, isTabHotkey, isEnterHotkey, isVirtualKey, isDelete, getFirstTextManage } from '@plait/common';
import { isHotkey } from 'is-hotkey';
import { getMindElementCenter, getNextMindElementByDirection } from '../utils/position';

const NAVIGATION_SELECTED_ELEMENT = new WeakMap<PlaitBoard, { selected: MindElement; previous?: MindElement }>();

const getNavigationDirection = (event: KeyboardEvent): Direction | null => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
        return null;
    }
    switch (event.key) {
        case 'ArrowLeft':
            return Direction.left;
        case 'ArrowRight':
            return Direction.right;
        case 'ArrowUp':
            return Direction.top;
        case 'ArrowDown':
            return Direction.bottom;
        default:
            return null;
    }
};

const selectMindElement = (board: PlaitBoard, element: MindElement, previous?: MindElement) => {
    NAVIGATION_SELECTED_ELEMENT.set(board, { selected: element, previous });
    const center = getMindElementCenter(element);
    Transforms.setSelection(board, { anchor: center, focus: center });
};

export const withMindHotkey = (baseBoard: PlaitBoard) => {
    const board = baseBoard as PlaitBoard & PlaitMindBoard;
    const { keyDown, globalKeyDown, pointerDown } = board;

    board.pointerDown = (event: PointerEvent) => {
        NAVIGATION_SELECTED_ELEMENT.delete(board);
        pointerDown(event);
    };

    board.keyDown = (event: KeyboardEvent) => {
        const selectedElements = getSelectedElements(board);
        const isSingleSelection = selectedElements.length === 1;
        const isSingleMindElement = selectedElements.length === 1 && MindElement.isMindElement(board, selectedElements[0]);
        const targetElement = selectedElements[0] as MindElement;
        let navigationSelectedElement = NAVIGATION_SELECTED_ELEMENT.get(board);
        if (navigationSelectedElement && navigationSelectedElement.selected !== targetElement) {
            NAVIGATION_SELECTED_ELEMENT.delete(board);
            navigationSelectedElement = undefined;
        }

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
        if (
            navigationDirection &&
            isSingleMindElement &&
            !PlaitBoard.hasBeenTextEditing(board)
        ) {
            const nextElement = getNextMindElementByDirection(
                board,
                targetElement,
                navigationDirection,
                navigationSelectedElement?.previous
            );
            if (nextElement) {
                event.preventDefault();
                selectMindElement(board, nextElement, targetElement);
                return;
            }
            event.preventDefault();
            return;
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
