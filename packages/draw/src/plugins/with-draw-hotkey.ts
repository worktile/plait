import { PlaitBoard } from '@plait/core';
import { getSelectedDrawElements } from '../utils/selected';
import { PlaitDrawElement, PlaitGeometry, PlaitLine } from '../interfaces';
import { CommonTransforms } from '@plait/common';

export const withDrawHotkey = (baseBoard: PlaitBoard) => {
    const board = baseBoard as PlaitBoard;
    const { deleteFragment } = board;

    board.deleteFragment = (data: DataTransfer | null) => {
        const drawElements = getSelectedDrawElements(board);
        if (drawElements.length) {
            const geometryElements = drawElements.filter(value => PlaitDrawElement.isGeometry(value)) as PlaitGeometry[];

            // query bound lines
            const boundLineElements: PlaitLine[] = [];

            CommonTransforms.removeElements(board, [...geometryElements, ...boundLineElements]);
        }
        deleteFragment(data);
    };

    return board;
};
