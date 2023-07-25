import { PlaitBoard, Range, RectangleClient } from '@plait/core';
import { MindElement } from '../../interfaces/element';
import { ImageData } from '../../interfaces/element-data';
import { getRectangleByNode } from './node';
import { NodeSpace } from '../space/node-space';
import { PlaitMindBoard } from '../../plugins/with-mind.board';

export function getImageForeignRectangle(board: PlaitMindBoard, element: MindElement<ImageData>): RectangleClient {
    let { x, y } = getRectangleByNode(MindElement.getNode(element));
    x = x + NodeSpace.getTextLeftSpace(board, element);
    y = NodeSpace.getImageTopSpace(element) + y;
    const { width, height } = element.data.image!;
    const rectangle = {
        x,
        y,
        width,
        height
    };
    return RectangleClient.getOutlineRectangle(rectangle, -6);
}

export const isHitImage = (board: PlaitBoard, element: MindElement<ImageData>, range: Range) => {
    const client = getImageForeignRectangle(board as PlaitMindBoard, element);
    return RectangleClient.isHit(RectangleClient.toRectangleClient([range.anchor, range.focus]), client);
};
