import { RoughSVG } from 'roughjs/bin/svg';
import { drawRoundRectangle, normalizePoint } from '@plait/core';
import { DEAFULT_NODE_ACTIVE_STYLES, DEAFULT_NODE_STYLES, OUTLINE_BUFFR } from '../constants';
import { FlowElementStyles } from '../interfaces/element';
import { FlowNode } from '../interfaces/node';

export function drawNode(roughSVG: RoughSVG, node: FlowNode, outline = false) {
    let nodeStyles: FlowElementStyles = {
        ...DEAFULT_NODE_STYLES,
        ...(node.styles || {})
    };
    let { x, y } = normalizePoint(node.points![0]);
    let { width, height } = node;
    x = x + OUTLINE_BUFFR;
    y = y + OUTLINE_BUFFR;
    width = width - OUTLINE_BUFFR * 2;
    height = height - OUTLINE_BUFFR * 2;
    const nodeG = drawRoundRectangle(roughSVG, x, y, x + width, y + height, nodeStyles, outline);
    return nodeG;
}

export function drawActiveMask(roughSVG: RoughSVG, node: FlowNode) {
    let nodeStyles: FlowElementStyles = {
        ...DEAFULT_NODE_ACTIVE_STYLES,
        ...(node.styles || {})
    };
    let { x, y } = normalizePoint(node.points![0]);
    let { width, height } = node;
    nodeStyles = {
        ...nodeStyles,
        stroke: node.styles?.activeStroke || DEAFULT_NODE_ACTIVE_STYLES.stroke
    };
    const nodeG = drawRoundRectangle(roughSVG, x, y, x + width, y + height, nodeStyles, true);
    return nodeG;
}
