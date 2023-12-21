import { PlaitBoard, Transforms, getSelectedElements } from '@plait/core';
import { MindElement, PlaitMind } from '../interfaces';
import { AbstractNode } from '@plait/layouts';
import { MindTransforms } from '../transforms';
import { editTopic } from '../utils/node/common';
import { PlaitMindBoard } from './with-mind.board';
import { isSpaceHotkey, isExpandHotkey, isTabHotkey, isEnterHotkey, isVirtualKey, isDelete } from '@plait/common';

export const withMindHotkey = (baseBoard: PlaitBoard) => {
    const board = baseBoard as PlaitBoard & PlaitMindBoard;
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

        keydown(event);
    };

    return board;
};
