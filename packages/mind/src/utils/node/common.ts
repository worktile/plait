import { PlaitBoard, PlaitElement, getSelectedElements } from '@plait/core';
import { MindElement } from '../../interfaces/element';
import { MindNodeComponent } from '../../mind-node.component';

export function editTopic(element: MindElement) {
    const component = PlaitElement.getComponent(element) as MindNodeComponent;
    component?.editTopic();
}

export const getSelectedMindElements = (board: PlaitBoard) => {
    const selectedElements = getSelectedElements(board).filter(value => MindElement.isMindElement(board, value)) as MindElement[];
    return selectedElements;
};
