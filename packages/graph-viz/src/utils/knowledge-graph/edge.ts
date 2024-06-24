import Graph from 'graphology';
import { KnowledgeGraphEdgeDirection, KnowledgeGraphNode } from '../../interfaces';

export function getEdgeInfo(graph: Graph<KnowledgeGraphNode>, edge: string) {
    const source = graph.source(edge);
    const target = graph.target(edge);
    const outEdges = graph.outEdges(target);
    const isMain = graph.getNodeAttribute(source, 'isMain');
    return {
        isSourceMain: !!isMain,
        isTargetMain: !!graph.getNodeAttribute(graph.source(outEdges[0]), 'isMain')
    };
}

export function getEdgeDirection(info: { isSourceMain: boolean; isTargetMain: boolean }) {
    if (info.isSourceMain) {
        return KnowledgeGraphEdgeDirection.OUT;
    } else if (info.isTargetMain) {
        return KnowledgeGraphEdgeDirection.IN;
    }
    return KnowledgeGraphEdgeDirection.NONE;
}
