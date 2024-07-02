import { PlaitBoard, PlaitElement, getSelectedElements } from '@plait/core';
import { MindElement } from '../../interfaces/element';
import { getFirstTextManage } from '@plait/common';

export function editTopic(element: MindElement) {
    const textManage = getFirstTextManage(element);
    textManage?.edit(
        () => {},
        event => {
            const keyboardEvent = event as KeyboardEvent;
            return keyboardEvent.key === 'Enter' && !keyboardEvent.shiftKey;
        }
    );
}

export const getSelectedMindElements = (board: PlaitBoard, elements?: PlaitElement[]) => {
    const selectedElements = elements?.length ? elements : getSelectedElements(board);
    return selectedElements.filter(value => MindElement.isMindElement(board, value)) as MindElement[];
};
