import { PlaitBoard, PlaitElement, getSelectedElements } from '@plait/core';
import { isVirtualKey, isSpaceHotkey } from '@plait/common';
import { GeometryComponent } from '../geometry.component';

export const withDrawHotkey = (board: PlaitBoard) => {
    const { keydown } = board;
    board.keydown = (event: KeyboardEvent) => {
        const selectedElements = getSelectedElements(board);
        const isSingleSelection = selectedElements.length === 1;
        const targetElement = selectedElements[0];

        if (!isVirtualKey(event) && !isSpaceHotkey(event) && isSingleSelection) {
            event.preventDefault();

            (PlaitElement.getComponent(targetElement) as GeometryComponent).editText();
            return;
        }

        keydown(event);
    };
    return board;
};
