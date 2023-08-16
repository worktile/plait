import { PlaitBoard, Range, RectangleClient } from '@plait/core';
import { MindElement } from '../../interfaces/element';
import { ImageData } from '../../interfaces/element-data';
import { getRectangleByNode } from './node';
import { NodeSpace } from '../space/node-space';
import { PlaitMindBoard } from '../../plugins/with-mind.board';
import { RESIZE_HANDLE_DIAMETER } from '@plait/common';

export function getImageForeignRectangle(board: PlaitMindBoard, element: MindElement<ImageData>): RectangleClient {
    let { x, y } = getRectangleByNode(MindElement.getNode(element));
    const elementWidth = element.manualWidth || element.width;

    x =
        elementWidth > element.data.image.width
            ? x + NodeSpace.getTextLeftSpace(board, element) + (elementWidth - element.data.image.width) / 2
            : x + NodeSpace.getTextLeftSpace(board, element);
    y = NodeSpace.getImageTopSpace(board, element) + y;
    const { width, height } = element.data.image!;
    const rectangle = {
        x,
        y,
        width,
        height
    };
    return rectangle;
}

export const isHitImage = (board: PlaitBoard, element: MindElement<ImageData>, range: Range) => {
    const imageRectangle = getImageForeignRectangle(board as PlaitMindBoard, element);
    const imageOutlineRectangle = RectangleClient.getOutlineRectangle(imageRectangle, -RESIZE_HANDLE_DIAMETER / 2);
    return RectangleClient.isHit(RectangleClient.toRectangleClient([range.anchor, range.focus]), imageOutlineRectangle);
};
