import { PlaitBoard } from '@plait/core';
import { getSelectedDrawElements } from '../utils/selected';
import { PlaitDrawElement, PlaitGeometry, PlaitLine } from '../interfaces';
import { CommonTransforms } from '@plait/common';

export const withDrawHotkey = (baseBoard: PlaitBoard) => {
    const board = baseBoard as PlaitBoard;
    return board;
};
