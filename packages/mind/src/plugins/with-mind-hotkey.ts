import { PlaitBoard, Transforms, getSelectedElements, hotkeys } from '@plait/core';
import { MindElement, PlaitMind } from '../interfaces';
import { isKeyHotkey } from 'is-hotkey';

export const withMindHotkey = (board: PlaitBoard) => {
    const { keydown } = board;

    board.keydown = (keyboardEvent: KeyboardEvent) => {
        if (isExpandHotkey(keyboardEvent)) {
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

        keydown(keyboardEvent);
    };

    return board;
};

export const isExpandHotkey = (keyboardEvent: KeyboardEvent) => {
    return isKeyHotkey('mod+/', keyboardEvent);
};
