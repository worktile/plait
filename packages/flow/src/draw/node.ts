import { RoughSVG } from 'roughjs/bin/svg';
import { FlowElementStyles, FlowNode } from '../interfaces';
import { drawRoundRectangle, normalizePoint } from '@plait/core';
import { DEAFULT_NODE_ACTIVE_STYLES, DEAFULT_NODE_STYLES, OUTLINE_BUFFR } from '../constants';

export function drawNode(roughSVG: RoughSVG, node: FlowNode, outline = false) {
    let nodeStyles: FlowElementStyles = {
        ...DEAFULT_NODE_STYLES,
        ...(node.styles || {})
    };
    let { x, y } = normalizePoint(node.points![0]);
    let { width, height } = node;
    if (!outline) {
        x = x + OUTLINE_BUFFR;
        y = y + OUTLINE_BUFFR;
        width = width - OUTLINE_BUFFR * 2;
        height = height - OUTLINE_BUFFR * 2;
    }
    if (outline) {
        nodeStyles = {
            ...nodeStyles,
            stroke: node.styles?.activeStroke || DEAFULT_NODE_ACTIVE_STYLES.stroke,
            fill: node.styles?.activeFill || DEAFULT_NODE_ACTIVE_STYLES.fill
        };
    }

    const nodeG = drawRoundRectangle(roughSVG, x, y, x + width, y + height, nodeStyles, outline);
    return nodeG;
}
