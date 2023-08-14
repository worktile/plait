import { PlaitBoard, getSelectedElements } from '@plait/core';
import { PlaitDrawElement } from '../interfaces';

export const getSelectedDrawElements = (board: PlaitBoard) => {
    const selectedElements = getSelectedElements(board).filter(value => PlaitDrawElement.isDrawElement(value)) as PlaitDrawElement[];
    return selectedElements;
};
