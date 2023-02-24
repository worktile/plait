import { RoughSVG } from 'roughjs/bin/svg';
import { FlowNode } from '../interfaces';
import { Options } from 'roughjs/bin/core';
import { getRectangleByNode } from '../utils/get-rectangle-by-node';

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

export function drawRoundRectangle(rs: RoughSVG, x1: number, y1: number, x2: number, y2: number, options: Options, outline = false) {
    const width = Math.abs(x1 - x2);
    const height = Math.abs(y1 - y2);

    const defaultRadius = Math.min(width, height) / 8;
    let radius = defaultRadius;
    if (defaultRadius > 16) {
        radius = outline ? 16 + 2 : 16;
    }

    const point1 = [x1 + radius, y1];
    const point2 = [x2 - radius, y1];
    const point3 = [x2, y1 + radius];
    const point4 = [x2, y2 - radius];
    const point5 = [x2 - radius, y2];
    const point6 = [x1 + radius, y2];
    const point7 = [x1, y2 - radius];
    const point8 = [x1, y1 + radius];

    return rs.path(
        `M${point2[0]} ${point2[1]} A ${radius} ${radius}, 0, 0, 1, ${point3[0]} ${point3[1]} L ${point4[0]} ${point4[1]} A ${radius} ${radius}, 0, 0, 1, ${point5[0]} ${point5[1]} L ${point6[0]} ${point6[1]} A ${radius} ${radius}, 0, 0, 1, ${point7[0]} ${point7[1]} L ${point8[0]} ${point8[1]} A ${radius} ${radius}, 0, 0, 1, ${point1[0]} ${point1[1]} Z`,
        options
    );
}
