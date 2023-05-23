import { MindNode } from '../../interfaces/node';
import { PlaitMindBoard } from '../../plugins/with-extend-mind';
import { NodeSpace } from '../space/node-space';
import { getRectangleByNode } from './node';

export function getRichtextRectangleByNode(board: PlaitMindBoard, node: MindNode) {
    let { x, y } = getRectangleByNode(node);
    x = x + NodeSpace.getTextLeftSpace(board, node.origin);
    y = y + NodeSpace.getTextTopSpace(node.origin);
    const width = Math.ceil(node.origin.width);
    const height = Math.ceil(node.origin.height);
    return { height, width, x, y };
}
