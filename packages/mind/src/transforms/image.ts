import { PlaitBoard, Transforms } from '@plait/core';
import { ImageData, MindElement } from '../interfaces';
import { removeImageFocus } from '../utils/node/image';
import { NodeSpace } from '../utils/space/node-space';
import { PlaitMindBoard } from '../plugins/with-mind.board';
import { getNewNodeHeight } from '../utils/node/dynamic-width';
import { CommonImageItem } from '@plait/common';

export const removeImage = (board: PlaitBoard, element: MindElement<ImageData>) => {
    removeImageFocus(board, element);
    const newElement = {
        data: { ...element.data }
    } as MindElement;
    delete newElement.data.image;
    const path = PlaitBoard.findPath(board, element);

    const newDynamicWidth = NodeSpace.getNodeNewDynamicWidth(board as PlaitMindBoard, element, 0);
    const newHeight = getNewNodeHeight(board as PlaitMindBoard, element, newDynamicWidth);
    if (newHeight) {
        newElement.height = newHeight / board.viewport.zoom;
    }

    Transforms.setNode(board, newElement, path);
};

export const setImage = (board: PlaitBoard, element: MindElement, imageItem: CommonImageItem) => {
    const newElement = {
        data: { ...element.data, image: imageItem }
    };

    const newDynamicWidth = NodeSpace.getNodeNewDynamicWidth(board as PlaitMindBoard, element, imageItem.width);
    const newHeight = getNewNodeHeight(board as PlaitMindBoard, element, newDynamicWidth);
    if (newHeight) {
        (newElement as MindElement).height = newHeight / board.viewport.zoom;
    }

    const path = PlaitBoard.findPath(board, element);
    Transforms.setNode(board, newElement, path);
};
