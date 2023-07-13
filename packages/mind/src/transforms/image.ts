import { PlaitBoard, Transforms } from '@plait/core';
import { ImageData, MindElement } from '../interfaces';

export const removeImage = (board: PlaitBoard, element: MindElement<ImageData>) => {
    const newElement = {
        data: { ...element.data }
    } as MindElement;
    delete newElement.data.image;
    const path = PlaitBoard.findPath(board, element);
    Transforms.setNode(board, newElement, path);
};
