import { RoughSVG } from 'roughjs/bin/svg';
import { FlowNode } from '../interfaces';
import { Options } from 'roughjs/bin/core';
import { drawRoundRectangle, normalizePoint } from '@plait/core';

export function drawRectangleNode(roughSVG: RoughSVG, node: FlowNode) {
    const options: Options = node.styles || {};
    const { x, y } = normalizePoint(node.points![0]);
    const nodeG = drawRoundRectangle(roughSVG, x, y, x + node.width, y + node.height, {
        stroke: '#F5F5F5',
        strokeWidth: 2,
        fill: '#DFE1E5',
        fillStyle: 'solid',
        ...options
    });

    return nodeG;
}
