import { PlaitBoard, getSelectedElements } from '@plait/core';
import { FlowElement } from '../interfaces/element';

export function isActiveElement(board: PlaitBoard, element: FlowElement) {
    const selectedElements = getSelectedElements(board);
    if (selectedElements.length) {
        return element.id === selectedElements[0]?.id;
    }
    return false;
}
