import { PlaitBoard, PlaitElement } from '@plait/core';
import { MindNodeComponent } from '../../mind-node.component';
import { MindElement } from '../../interfaces/element';
import { ImageData } from '../../interfaces/element-data';
import { addElementOfFocusedImage, removeElementOfFocusedImage } from '@plait/common';

export const addImageFocus = (board: PlaitBoard, element: MindElement<ImageData>) => {
    addElementOfFocusedImage(board, element);
    const elementComponent = PlaitElement.getComponent(element) as MindNodeComponent;
    elementComponent.imageGenerator.componentRef!.instance.isFocus = true;
    elementComponent.imageGenerator.componentRef!.instance.cdr.markForCheck();
};

export const removeImageFocus = (board: PlaitBoard, element: MindElement<ImageData>) => {
    removeElementOfFocusedImage(board);
    const elementComponent = PlaitElement.getComponent(element) as MindNodeComponent;
    elementComponent.imageGenerator.componentRef!.instance.isFocus = false;
    elementComponent.imageGenerator.componentRef!.instance.cdr.markForCheck();
};
