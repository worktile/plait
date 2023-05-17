import { MindNode } from '../interfaces/node';
import { getRectangleByNode } from '../utils/graph';
import { PlaitBoard, drawRoundRectangle } from '@plait/core';
import { getStrokeByMindElement } from '../utils/node-style/shape';
import { DefaultNodeStyle, DefaultRootStyle } from '../constants/node-style';

export function drawRectangleNode(board: PlaitBoard, node: MindNode) {
    const { x, y, width, height } = getRectangleByNode(node);

    const fill = node.origin.fill ? node.origin.fill : node.origin.isRoot ? DefaultRootStyle.fill : DefaultNodeStyle.fill;
    const stroke = getStrokeByMindElement(board, node.origin);
    const strokeWidth = node.origin.strokeWidth ? node.origin.strokeWidth : DefaultNodeStyle.strokeWidth;

    const nodeG = drawRoundRectangle(PlaitBoard.getRoughSVG(board), x, y, x + width, y + height, {
        stroke,
        strokeWidth,
        fill,
        fillStyle: 'solid'
    });

    return nodeG;
}
