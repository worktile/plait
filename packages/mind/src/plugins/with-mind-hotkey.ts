import { PlaitBoard, PlaitOperation, Transforms, getSelectedElements } from '@plait/core';
import { MindElement, PlaitMind } from '../interfaces';
import { AbstractNode } from '@plait/layouts';
import { MindTransforms } from '../transforms';
import { editTopic } from '../utils/node/common';
import { PlaitMindBoard } from './with-mind.board';
import { isSpaceHotkey, isExpandHotkey, isTabHotkey, isEnterHotkey, isVirtualKey, isDelete, getFirstTextManage } from '@plait/common';
import isHotkey from 'is-hotkey';

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
                const previousOp =  undos.length > 0 ? undos[undos.length - 1][0] : undefined;
                if (previousOp && previousOp.type === 'insert_node' && MindElement.isMindElement(board, previousOp.node) && getFirstTextManage(previousOp.node).isEditing) {
                    board.undo();
                }
            }
        }
        globalKeyDown(event);
    };

    return board;
};
