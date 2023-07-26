import { PlaitBoard, PlaitElement } from '@plait/core';
import { MindNodeComponent } from '../../node.component';
import { MindElement } from '../../interfaces';

const BOARD_TO_SELECTED_IMAGE_ELEMENT = new WeakMap<PlaitBoard, MindElement>();

export const getSelectedImageElement = (board: PlaitBoard) => {
    return BOARD_TO_SELECTED_IMAGE_ELEMENT.get(board);
};

export const addSelectedImageElement = (board: PlaitBoard, element: MindElement) => {
    BOARD_TO_SELECTED_IMAGE_ELEMENT.set(board, element);
};

export const removeSelectedImageElement = (board: PlaitBoard) => {
    BOARD_TO_SELECTED_IMAGE_ELEMENT.delete(board);
};

export const setImageFocus = (board: PlaitBoard, element: MindElement, isFocus: boolean) => {
    if (isFocus) {
        addSelectedImageElement(board, element);
    } else {
        removeSelectedImageElement(board);
    }

    const elementComponent = PlaitElement.getComponent(element) as MindNodeComponent;
    elementComponent.imageDrawer.componentRef!.instance.isFocus = isFocus;
    elementComponent.imageDrawer.componentRef!.instance.cdr.markForCheck();
};
