import { RoughSVG } from 'roughjs/bin/svg';
import { drawRoundRectangle, normalizePoint } from '@plait/core';
import { FlowElementStyles } from '../interfaces/element';
import { FlowNode } from '../interfaces/node';
import { DEFAULT_NODE_ACTIVE_STYLES, DEFAULT_NODE_STYLES, OUTLINE_BUFFER } from '../constants/node';

export function drawNode(roughSVG: RoughSVG, node: FlowNode, outline = false) {
    let nodeStyles: FlowElementStyles = {
        ...DEFAULT_NODE_STYLES,
        ...(node.styles || {})
    };
    let { x, y } = normalizePoint(node.points![0]);
    let { width, height } = node;
    x = x + OUTLINE_BUFFER;
    y = y + OUTLINE_BUFFER;
    width = width - OUTLINE_BUFFER * 2;
    height = height - OUTLINE_BUFFER * 2;
    const nodeG = drawRoundRectangle(roughSVG, x, y, x + width, y + height, nodeStyles, outline);
    return nodeG;
}

export function drawActiveMask(roughSVG: RoughSVG, node: FlowNode) {
    let nodeStyles: FlowElementStyles = {
        ...DEFAULT_NODE_ACTIVE_STYLES,
        ...(node.styles || {})
    };
    let { x, y } = normalizePoint(node.points![0]);
    let { width, height } = node;
    nodeStyles = {
        ...nodeStyles,
        stroke: node.styles?.activeStroke || DEFAULT_NODE_ACTIVE_STYLES.stroke
    };
    const nodeG = drawRoundRectangle(roughSVG, x, y, x + width, y + height, nodeStyles, true);
    return nodeG;
}
