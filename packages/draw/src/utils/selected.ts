import { PlaitBoard, getSelectedElements } from '@plait/core';
import { PlaitDrawElement, PlaitGeometry, PlaitLine } from '../interfaces';

export const getSelectedDrawElements = (board: PlaitBoard) => {
    const selectedElements = getSelectedElements(board).filter(
        value => PlaitDrawElement.isGeometry(value) || PlaitDrawElement.isLine(value)
    ) as (PlaitGeometry | PlaitLine)[];
    return selectedElements;
};
