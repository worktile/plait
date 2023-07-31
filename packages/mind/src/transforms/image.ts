import { PlaitBoard, Transforms } from '@plait/core';
import { ImageData, MindElement } from '../interfaces';
import { setImageFocus } from '../utils/node/image';

export const removeImage = (board: PlaitBoard, element: MindElement<ImageData>) => {
    setImageFocus(board, element, false);
    const newElement = {
        data: { ...element.data }
    } as MindElement;
    delete newElement.data.image;
    const path = PlaitBoard.findPath(board, element);
    Transforms.setNode(board, newElement, path);
};
