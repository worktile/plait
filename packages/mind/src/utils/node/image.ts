import { PlaitBoard, PlaitElement } from '@plait/core';
import { MindNodeComponent } from '../../mind-node.component';
import { MindElement } from '../../interfaces/element';
import { ImageData } from '../../interfaces/element-data';

const BOARD_TO_SELECTED_IMAGE_ELEMENT = new WeakMap<PlaitBoard, MindElement<ImageData>>();

export const getSelectedImageElement = (board: PlaitBoard) => {
    return BOARD_TO_SELECTED_IMAGE_ELEMENT.get(board);
};

export const addSelectedImageElement = (board: PlaitBoard, element: MindElement<ImageData>) => {
    BOARD_TO_SELECTED_IMAGE_ELEMENT.set(board, element);
};

export const removeSelectedImageElement = (board: PlaitBoard) => {
    BOARD_TO_SELECTED_IMAGE_ELEMENT.delete(board);
};

export const setImageFocus = (board: PlaitBoard, element: MindElement<ImageData>, isFocus: boolean) => {
    if (isFocus) {
        addSelectedImageElement(board, element);
    } else {
        removeSelectedImageElement(board);
    }

    const elementComponent = PlaitElement.getComponent(element) as MindNodeComponent;
    elementComponent.imageGenerator.componentRef!.instance.isFocus = isFocus;
    elementComponent.imageGenerator.componentRef!.instance.cdr.markForCheck();
};
