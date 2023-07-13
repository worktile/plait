import { PlaitBoard, Point, RectangleClient } from '@plait/core';
import { MindElement } from '../../interfaces/element';
import { EmojiData } from '../../interfaces/element-data';
import { getRectangleByNode } from './node';
import { NodeSpace } from '../space/node-space';
import { getEmojisWidthHeight } from '../space/emoji';
import { PlaitMindBoard } from '../../plugins/with-mind.board';

export function getEmojiRectangle(board: PlaitMindBoard, element: MindElement<EmojiData>): RectangleClient {
    let { x, y } = getRectangleByNode(MindElement.getNode(element));
    x = x + NodeSpace.getEmojiLeftSpace(board, element);
    const { width, height } = getEmojisWidthHeight(board, element);
    return {
        x,
        y,
        width,
        height
    };
}

export function getEmojiForeignRectangle(board: PlaitMindBoard, element: MindElement<EmojiData>): RectangleClient {
    let { x, y } = getRectangleByNode(MindElement.getNode(element));
    x = x + NodeSpace.getEmojiLeftSpace(board, element);
    const { width } = getEmojisWidthHeight(board, element);
    return {
        x,
        y,
        width,
        height: NodeSpace.getNodeHeight(board, element)
    };
}

export const isHitEmojis = (board: PlaitBoard, element: MindElement<EmojiData>, point: Point) => {
    return RectangleClient.isHit(RectangleClient.toRectangleClient([point, point]), getEmojiRectangle(board as PlaitMindBoard, element));
};
