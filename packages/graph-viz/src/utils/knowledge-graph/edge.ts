import Graph from 'graphology';
import { KnowledgeGraphEdgeDirection, KnowledgeGraphNode } from '../../interfaces';

export function getEdgeInfo(graph: Graph<KnowledgeGraphNode>, edge: string) {
    const source = graph.source(edge);
    const target = graph.target(edge);
    const outEdges = graph.outEdges(target);
    const isActive = graph.getNodeAttribute(source, 'isActive');
    return {
        isSourceActive: !!isActive,
        isTargetActive: !!graph.getNodeAttribute(graph.source(outEdges[0]), 'isActive')
    };
}

export function getEdgeDirection(info: { isSourceActive: boolean; isTargetActive: boolean }) {
    if (info.isSourceActive) {
        return KnowledgeGraphEdgeDirection.OUT;
    } else if (info.isTargetActive) {
        return KnowledgeGraphEdgeDirection.IN;
    }
    return KnowledgeGraphEdgeDirection.NONE;
}
