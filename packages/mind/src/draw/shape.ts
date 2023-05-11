import { NODE_FILL, ROOT_NODE_FILL, STROKE_WIDTH } from '../constants';
import { MindNode } from '../interfaces/node';
import { getStrokeByMindElement } from '../utils/colors';
import { getRectangleByNode } from '../utils/graph';
import { PlaitBoard, drawRoundRectangle } from '@plait/core';

export function drawRectangleNode(board: PlaitBoard, node: MindNode) {
    const { x, y, width, height } = getRectangleByNode(node);

    const fill = node.origin.fill ? node.origin.fill : node.origin.isRoot ? ROOT_NODE_FILL : NODE_FILL;
    const stroke = getStrokeByMindElement(node.origin);
    const strokeWidth = node.origin.strokeWidth ? node.origin.strokeWidth : STROKE_WIDTH;

    const nodeG = drawRoundRectangle(PlaitBoard.getRoughSVG(board), x, y, x + width, y + height, {
        stroke,
        strokeWidth,
        fill,
        fillStyle: 'solid'
    });

    return nodeG;
}
