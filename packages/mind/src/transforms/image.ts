import { PlaitBoard, Transforms } from '@plait/core';
import { ImageData, MindElement } from '../interfaces';
import { removeImageFocus } from '../utils/node/image';
import { CommonImageItem } from '@plait/common';

export const removeImage = (board: PlaitBoard, element: MindElement<ImageData>) => {
    removeImageFocus(board, element);
    const newElement = {
        data: { ...element.data, topic: { ...element.data.topic } }
    } as MindElement;
    delete newElement.data.image;
    const path = PlaitBoard.findPath(board, element);
    Transforms.setNode(board, newElement, path);
};

export const setImage = (board: PlaitBoard, element: MindElement, imageItem: CommonImageItem) => {
    const newElement = {
        data: { ...element.data, image: imageItem, topic: { ...element.data.topic } }
    };
    const path = PlaitBoard.findPath(board, element);
    Transforms.setNode(board, newElement, path);
};
