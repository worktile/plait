import { RoughSVG } from 'roughjs/bin/svg';
import { FlowNode } from '../interfaces';
import { Options } from 'roughjs/bin/core';
import { getRectangleByNode } from '../utils/get-rectangle-by-node';
import { drawRoundRectangle } from '@plait/core';

export function drawRectangleNode(roughSVG: RoughSVG, node: FlowNode) {
    const options: Options = node.options || {};
    const { x, y, width, height } = getRectangleByNode(node);
    const nodeG = drawRoundRectangle(roughSVG, x, y, x + width, y + height, {
        stroke: '#F5F5F5',
        strokeWidth: 2,
        fill: '#DFE1E5',
        fillStyle: 'solid',
        ...options
    });

    return nodeG;
}
