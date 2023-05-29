import { MindElement } from '../../interfaces/element';
import { MindNode } from '../../interfaces/node';
import { PlaitMindBoard } from '../../plugins/with-mind.board';
import { NodeSpace } from '../space/node-space';
import { getRectangleByNode } from './node';
import { RectangleClient } from '@plait/core';

export function getTopicRectangleByNode(board: PlaitMindBoard, node: MindNode) {
    let nodeRectangle = getRectangleByNode(node);
    return getTopicRectangleByElement(board, nodeRectangle, node.origin);
}

export function getTopicRectangleByElement(board: PlaitMindBoard, nodeRectangle: RectangleClient, element: MindElement) {
    const x = nodeRectangle.x + NodeSpace.getTextLeftSpace(board, element);
    const y = nodeRectangle.y + NodeSpace.getTextTopSpace(element);
    const width = Math.ceil(element.width);
    const height = Math.ceil(element.height);
    return { height, width, x, y };
}
