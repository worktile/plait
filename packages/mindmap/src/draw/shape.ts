import { RoughSVG } from 'roughjs/bin/svg';
import { NODE_FILL, ROOT_NODE_FILL, STROKE_WIDTH, TRANSPARENT } from '../constants';
import { MindmapNode } from '../interfaces/node';
import { getStrokeByMindmapElement } from '../utils/colors';
import { drawRoundRectangle, getRectangleByNode } from '../utils/graph';

export function drawRectangleNode(roughSVG: RoughSVG, node: MindmapNode) {
    const { x, y, width, height } = getRectangleByNode(node);

    const fill = node.origin.fill ? node.origin.fill : node.origin.isRoot ? ROOT_NODE_FILL : NODE_FILL;
    const stroke = getStrokeByMindmapElement(node.origin);
    const strokeWidth = node.origin.strokeWidth ? node.origin.strokeWidth : STROKE_WIDTH;

    const nodeG = drawRoundRectangle(roughSVG, x, y, x + width, y + height, { stroke, strokeWidth, fill, fillStyle: 'solid' });

    return nodeG;
}

