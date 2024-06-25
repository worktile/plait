import Graph from 'graphology';
import { EdgeDirection, Positions, Node, NodeStyles } from './types';
import { NS, PlaitBoard, createG, createPath, drawCircle, normalizePoint } from '@plait/core';
import getArrow from './perfect-arrows/get-arrow';
import { DEFAULT_LINE_STYLES, DEFAULT_NODE_SIZE, DEFAULT_NODE_STYLES } from './constants';
import { DEFAULT_STYLES } from '../constants/default';
import { edgePointAnimate, getEdgeDirection, getEdgeInfo } from './utils';

export function drawNode(board: PlaitBoard, node: Node, positions: Positions) {
    const roughSVG = PlaitBoard.getRoughSVG(board);
    let nodeStyles: NodeStyles = {
        ...DEFAULT_NODE_STYLES,
        ...(node.styles || {})
    };
    let { x, y } = normalizePoint(positions[node.id]);
    const nodeG = drawCircle(roughSVG, [0, 0], DEFAULT_NODE_SIZE, nodeStyles);
    nodeG.setAttribute('transform', `translate(${x}, ${y})`);
    const text = document.createElementNS(NS, 'text');
    text.textContent = node.label || '';
    text.setAttribute('text-anchor', `middle`);
    text.setAttribute('dominant-baseline', `ideographic`);
    text.setAttribute('x', `0`);
    text.setAttribute('y', `${DEFAULT_NODE_SIZE}`);
    nodeG.append(text);
    return nodeG;
}

export function drawEdge(board: PlaitBoard, graph: Graph<Node>, edge: string, positions: Positions) {
    const roughSVG = PlaitBoard.getRoughSVG(board);
    const startPos = positions[graph.source(edge)];
    const endPos = positions[graph.target(edge)];
    // 起始和结束位置坐标
    const start = { x: startPos[0], y: startPos[1] };
    const end = { x: endPos[0], y: endPos[1] };
    const edgeInfo = getEdgeInfo(graph, edge);
    const direction = getEdgeDirection(edgeInfo);
    const isMutual = edgeInfo.isSourceActive && edgeInfo.isTargetActive;
    const arrow = getArrow(start.x, start.y, end.x, end.y, {
        stretch: 0.4,
        flip: direction === EdgeDirection.NONE ? false : isMutual
    });
    const [sx, sy, cx, cy, ex, ey, ae, as, ec] = arrow;
    const g = createG();
    const path = createPath();
    path.setAttribute('d', `M${sx},${sy} Q${cx},${cy} ${ex},${ey}`);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', DEFAULT_LINE_STYLES.color[direction]);
    g.append(path);
    const pointG = drawCircle(roughSVG, [0, 0], 5, {
        ...DEFAULT_STYLES,
        strokeWidth: 0,
        fill: DEFAULT_LINE_STYLES.color[direction]
    });
    pointG.setAttribute('transform', `translate(${start.x}, ${start.y})`);
    g.append(pointG);
    if (direction !== EdgeDirection.NONE) {
        edgePointAnimate(path, pointG);
    }
    return g;
}
