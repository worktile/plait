import { PlaitBoard, PlaitElement } from '@plait/core';
import { MindNodeComponent } from '../../mind-node.component';
import { MindElement } from '../../interfaces/element';
import { ImageData } from '../../interfaces/element-data';
import { addElementOfFocusedImage, removeElementOfFocusedImage } from '@plait/common';

export const setImageFocus = (board: PlaitBoard, element: MindElement<ImageData>, isFocus: boolean) => {
    if (isFocus) {
        addElementOfFocusedImage(board, element);
    } else {
        removeElementOfFocusedImage(board);
    }
    const elementComponent = PlaitElement.getComponent(element) as MindNodeComponent;
    elementComponent.imageGenerator.componentRef!.instance.isFocus = isFocus;
    elementComponent.imageGenerator.componentRef!.instance.cdr.markForCheck();
};
