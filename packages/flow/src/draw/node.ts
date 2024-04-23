import { PlaitBoard, drawRoundRectangle, normalizePoint } from '@plait/core';
import { FlowElementStyles } from '../interfaces/element';
import { FlowNode } from '../interfaces/node';
import { DEFAULT_NODE_ACTIVE_STYLES, DEFAULT_NODE_STYLES, OUTLINE_BUFFER } from '../constants/node';

export function drawNode(board: PlaitBoard, node: FlowNode, outline = false) {
    const roughSVG = PlaitBoard.getRoughSVG(board);
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
    const nodeG = drawRoundRectangle(
        roughSVG,
        x,
        y,
        x + width,
        y + height,
        nodeStyles,
        outline,
        nodeStyles.borderRadius || Math.min(width, height) / 2
    );
    return nodeG;
}

export function drawNodeActiveMask(board: PlaitBoard, node: FlowNode) {
    const roughSVG = PlaitBoard.getRoughSVG(board);
    let nodeStyles: FlowElementStyles = {
        ...DEFAULT_NODE_ACTIVE_STYLES,
        ...(node.styles || {})
    };
    let { x, y } = normalizePoint(node.points![0]);
    let { width, height } = node;
    nodeStyles = {
        ...nodeStyles,
        stroke: node.styles?.activeStroke || DEFAULT_NODE_ACTIVE_STYLES.stroke,
        fill: node.styles?.activeFill || DEFAULT_NODE_ACTIVE_STYLES.fill
    };
    const nodeG = drawRoundRectangle(
        roughSVG,
        x,
        y,
        x + width,
        y + height,
        nodeStyles,
        true,
        nodeStyles.borderRadius || Math.min(width, height) / 2
    );
    return nodeG;
}
