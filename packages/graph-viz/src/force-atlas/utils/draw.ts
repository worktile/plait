import { EdgeDirection, NodeStyles } from '../types';
import { NS, PlaitBoard, Point, createG, createPath, drawCircle, normalizePoint } from '@plait/core';
import getArrow from '../../perfect-arrows/get-arrow';
import {
    ACTIVE_BACKGROUND_NODE_ALPHA,
    DEFAULT_ACTIVE_NODE_SIZE_MULTIPLIER,
    DEFAULT_ACTIVE_WAVE_NODE_SIZE_MULTIPLIER,
    DEFAULT_LINE_STYLES,
    DEFAULT_NODE_LABEL_FONT_SIZE,
    DEFAULT_NODE_LABEL_MARGIN_TOP,
    DEFAULT_NODE_SIZE,
    DEFAULT_NODE_STYLES,
    SECOND_DEPTH_NODE_ALPHA
} from '../constants';
import { DEFAULT_STYLES } from '../../constants/default';
import { ForceAtlasNodeElement } from '../../interfaces';

export function drawNode(
    board: PlaitBoard,
    node: ForceAtlasNodeElement,
    point: Point,
    options: { isFirstDepth: boolean; nodeSizeMultiplier?: number; textOffsetY?: number }
) {
    const roughSVG = PlaitBoard.getRoughSVG(board);
    let nodeStyles: NodeStyles = {
        ...DEFAULT_NODE_STYLES,
        ...(node.styles || {})
    };
    let { x, y } = normalizePoint(point);
    const nodeRadius = ((node.size ?? DEFAULT_NODE_SIZE) * (options.nodeSizeMultiplier || 1)) / 2;
    const nodeG = drawCircle(roughSVG, [0, 0], nodeRadius, nodeStyles);
    nodeG.setAttribute('transform', `translate(${x}, ${y})`);
    if (!options.isFirstDepth) {
        nodeG.setAttribute('opacity', SECOND_DEPTH_NODE_ALPHA.toString());
    }
    const text = document.createElementNS(NS, 'text');
    text.textContent = node.label || '';
    text.setAttribute('text-anchor', `middle`);
    text.setAttribute('dominant-baseline', `hanging`);
    text.setAttribute('x', `0`);
    text.setAttribute('y', `${nodeRadius / 2 + DEFAULT_NODE_LABEL_MARGIN_TOP + (options.textOffsetY || 0)}`);
    text.setAttribute('font-size', `${DEFAULT_NODE_LABEL_FONT_SIZE}px`);
    nodeG.append(text);
    return nodeG;
}

export function drawActiveNode(board: PlaitBoard, node: ForceAtlasNodeElement, point: Point, isFirstDepth: boolean) {
    const roughSVG = PlaitBoard.getRoughSVG(board);
    const size = (node.size ?? DEFAULT_NODE_SIZE) * DEFAULT_ACTIVE_NODE_SIZE_MULTIPLIER;
    const nodeRadius = size / 2;
    const waveRadius = (size * DEFAULT_ACTIVE_WAVE_NODE_SIZE_MULTIPLIER) / 2;
    const nodeG = drawNode(board, node, point, {
        isFirstDepth,
        nodeSizeMultiplier: DEFAULT_ACTIVE_NODE_SIZE_MULTIPLIER,
        textOffsetY: (waveRadius - nodeRadius) / 2
    });
    const waveCircle = drawCircle(roughSVG, [0, 0], nodeRadius * DEFAULT_ACTIVE_WAVE_NODE_SIZE_MULTIPLIER, DEFAULT_NODE_STYLES);
    waveCircle.setAttribute('opacity', ACTIVE_BACKGROUND_NODE_ALPHA.toString());
    nodeG.append(waveCircle);
    return nodeG;
}

export function drawEdge(startPoint: Point, endPoint: Point, direction: EdgeDirection, isMutual: boolean) {
    const arrow = getArrow(startPoint[0], startPoint[1], endPoint[0], endPoint[1], {
        stretch: 0.4,
        flip: direction === EdgeDirection.NONE ? false : isMutual,
        padEnd: DEFAULT_NODE_SIZE / 4,
        padStart: DEFAULT_NODE_SIZE / 4
    });
    const [sx, sy, cx, cy, ex, ey, ae, as, ec] = arrow;
    const g = createG();
    const path = createPath();
    path.setAttribute('d', `M${sx},${sy} Q${cx},${cy} ${ex},${ey}`);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', DEFAULT_LINE_STYLES.color[direction]);
    g.append(path);
    return {
        g,
        path
    };
}

export function drawParticle(board: PlaitBoard, startPoint: Point, direction: EdgeDirection) {
    const roughSVG = PlaitBoard.getRoughSVG(board);
    const pointG = drawCircle(roughSVG, [0, 0], 5, {
        ...DEFAULT_STYLES,
        strokeWidth: 0,
        fill: DEFAULT_LINE_STYLES.color[direction]
    });
    pointG.setAttribute('transform', `translate(${startPoint[0]}, ${startPoint[1]})`);
    return pointG;
}
