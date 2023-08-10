import { PlaitBoard, PlaitElement, PlaitOptionsBoard, PlaitPluginKey, WithPluginOptions, getSelectedElements } from '@plait/core';
import { MindElement } from '../../interfaces/element';
import { MindNodeComponent } from '../../node.component';

export function editTopic(element: MindElement) {
    const component = PlaitElement.getComponent(element) as MindNodeComponent;
    component?.editTopic();
}

export const temporaryDisableSelection = (board: PlaitOptionsBoard) => {
    const currentOptions = board.getPluginOptions(PlaitPluginKey.withSelection);
    board.setPluginOptions<WithPluginOptions>(PlaitPluginKey.withSelection, {
        isDisabledSelect: true
    });
    setTimeout(() => {
        board.setPluginOptions<WithPluginOptions>(PlaitPluginKey.withSelection, { ...currentOptions });
    }, 0);
};

export const getSelectedMindElements = (board: PlaitBoard) => {
    const selectedElements = getSelectedElements(board).filter(value => MindElement.isMindElement(board, value)) as MindElement[];
    return selectedElements;
};
