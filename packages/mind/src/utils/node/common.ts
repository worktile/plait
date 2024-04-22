import { PlaitBoard, getSelectedElements } from '@plait/core';
import { MindElement } from '../../interfaces/element';
import { getFirstTextManage } from '@plait/common';
import { ExitOrigin } from '@plait/text';

export function editTopic(element: MindElement) {
    const textManage = getFirstTextManage(element);
    textManage?.edit((origin: ExitOrigin) => {
        if (origin === ExitOrigin.default) {
        }
    });
}

export const getSelectedMindElements = (board: PlaitBoard) => {
    const selectedElements = getSelectedElements(board).filter(value => MindElement.isMindElement(board, value)) as MindElement[];
    return selectedElements;
};
