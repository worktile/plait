import { PlaitBoard, PlaitElement } from '@plait/core';
import { MindElement } from '../../interfaces/element';
import { ImageData } from '../../interfaces/element-data';
import { ImageGenerator, PlaitCommonElementRef, addElementOfFocusedImage, removeElementOfFocusedImage } from '@plait/common';

export const addImageFocus = (board: PlaitBoard, element: MindElement<ImageData>) => {
    addElementOfFocusedImage(board, element);
    const commonElementRef = PlaitElement.getElementRef<PlaitCommonElementRef>(element);
    const imageGenerator = commonElementRef.getGenerator<ImageGenerator>(ImageGenerator.key);
    imageGenerator.setFocus(element, true);
};

export const removeImageFocus = (board: PlaitBoard, element: MindElement<ImageData>) => {
    removeElementOfFocusedImage(board);
    const commonElementRef = PlaitElement.getElementRef<PlaitCommonElementRef>(element);
    const imageGenerator = commonElementRef.getGenerator<ImageGenerator>(ImageGenerator.key);
    imageGenerator.setFocus(element, false);
};
