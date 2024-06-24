import { NS, PlaitBoard, drawCircle, normalizePoint } from '@plait/core';
import { KnowledgeGraphNode, KnowledgeGraphNodeStyles, KnowledgeGraphPositions } from '../../interfaces';
import { DEFAULT_KNOWLEDGE_GRAPH_NODE_SIZE, DEFAULT_KNOWLEDGE_GRAPH_NODE_STYLES } from '../../constants/node';

export function drawNode(board: PlaitBoard, node: KnowledgeGraphNode, positions: KnowledgeGraphPositions) {
    const roughSVG = PlaitBoard.getRoughSVG(board);
    let nodeStyles: KnowledgeGraphNodeStyles = {
        ...DEFAULT_KNOWLEDGE_GRAPH_NODE_STYLES,
        ...(node.styles || {})
    };
    let { x, y } = normalizePoint(positions[node.id]);
    const nodeG = drawCircle(roughSVG, [0, 0], DEFAULT_KNOWLEDGE_GRAPH_NODE_SIZE, nodeStyles);
    nodeG.setAttribute('transform', `translate(${x}, ${y})`);
    const text = document.createElementNS(NS, 'text');
    text.textContent = node.label || '';
    text.setAttribute('text-anchor', `middle`);
    text.setAttribute('dominant-baseline', `ideographic`);
    text.setAttribute('x', `0`);
    text.setAttribute('y', `${DEFAULT_KNOWLEDGE_GRAPH_NODE_SIZE}`);
    nodeG.append(text);
    return nodeG;
}
