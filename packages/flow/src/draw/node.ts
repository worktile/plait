import { RoughSVG } from 'roughjs/bin/svg';
import { FlowNode } from '../interfaces';
import { Options } from 'roughjs/bin/core';
import { getDefaultHandles } from '../utils/get-default-handles';
import { getHandlePosition } from '../utils';
import { OUTLINE_BUFFR } from '../constants';
import { getClientByNode } from '../queries/get-client-by-node';

/**
 * drawNode
 * @param roughSVG RoughSVG
 * @param node FlowNode
 * @param outline boolean
 * @returns SVGGElement
 */
export function drawNode(roughSVG: RoughSVG, node: FlowNode, options: Options = {}, outline = false) {
    const nodeOptions: Options = node.options || options;
    let { x, y, width, height } = getClientByNode(node);
    if (!outline) {
        x = x + OUTLINE_BUFFR;
        y = y + OUTLINE_BUFFR;
        width = width - OUTLINE_BUFFR * 2;
        height = height - OUTLINE_BUFFR * 2;
    }
    const nodeG = drawRoundRectangle(
        roughSVG,
        x,
        y,
        x + width,
        y + height,
        {
            strokeWidth: 2,
            fill: '#DFE1E5',
            fillStyle: 'solid',
            ...nodeOptions,
            stroke: outline ? 'rgb(38, 132, 255)' : nodeOptions.stroke ? nodeOptions.stroke : 'rgb(193 199 208)'
        },
        outline
    );

    return nodeG;
}

/**
 * drawRoundRectangle
 * @param rs RoughSVG
 * @param x1 number
 * @param y1 number
 * @param x2 number
 * @param y2 number
 * @param outline Options
 * @param outline boolean
 * @returns RoughSVG
 */
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

/**
 * drawHandles
 * @param roughSVG RoughSVG
 * @param node FlowNode
 * @returns RoughSVG[]
 */
export function drawHandles(roughSVG: RoughSVG, node: FlowNode) {
    const handles = node.handles || getDefaultHandles();
    const nodeRect = getClientByNode(node);

    return handles.map(handle => {
        const position = getHandlePosition(handle.position, nodeRect, handle);
        return roughSVG.circle(position.x, position.y, 8, {
            stroke: '#6698FF',
            strokeWidth: 2,
            fill: '#fff',
            fillStyle: 'solid'
        });
    });
}
