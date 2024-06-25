import { PlaitBoard, createG, createPath, drawCircle } from '@plait/core';
import { KnowledgeGraphEdgeDirection, KnowledgeGraphNode, KnowledgeGraphPositions } from '../../interfaces';
import Graph from 'graphology';
import { DEFAULT_KNOWLEDGE_GRAPH_LINE_STYLES } from '../../constants/edge';
import getArrow from '../../utils/line/arrow';
import { getEdgeDirection, getEdgeInfo } from '../../utils/knowledge-graph/edge';
import { DEFAULT_STYLES } from '../../constants/default';
import { edgePointAnimate } from './animate';

export function drawEdge(board: PlaitBoard, graph: Graph<KnowledgeGraphNode>, edge: string, positions: KnowledgeGraphPositions) {
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
        flip: direction === KnowledgeGraphEdgeDirection.NONE ? false : isMutual
    });
    const [sx, sy, cx, cy, ex, ey, ae, as, ec] = arrow;
    const g = createG();
    const path = createPath();
    path.setAttribute('d', `M${sx},${sy} Q${cx},${cy} ${ex},${ey}`);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', DEFAULT_KNOWLEDGE_GRAPH_LINE_STYLES.color[direction]);
    g.append(path);
    const pointG = drawCircle(roughSVG, [0, 0], 5, {
        ...DEFAULT_STYLES,
        strokeWidth: 0,
        fill: DEFAULT_KNOWLEDGE_GRAPH_LINE_STYLES.color[direction]
    });
    pointG.setAttribute('transform', `translate(${start.x}, ${start.y})`);
    g.append(pointG);
    if (direction !== KnowledgeGraphEdgeDirection.NONE) {
        edgePointAnimate(path, pointG);
    }
    return g;
}
