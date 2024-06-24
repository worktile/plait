import { PlaitBoard, createG } from '@plait/core';
import { Generator } from '@plait/common';
import { KnowledgeGraphElement, KnowledgeGraphNode, KnowledgeGraphPositions } from '../../interfaces';
import Graph from 'graphology';
import { drawEdge } from '../../draw/knowledge-graph/edge';

export class EdgeKnowledgeGraphGenerator extends Generator<KnowledgeGraphElement> {
    graph!: Graph<KnowledgeGraphNode>;
    graphPositions!: KnowledgeGraphPositions;
    constructor(board: PlaitBoard, graph: Graph<KnowledgeGraphNode>, graphPositions: KnowledgeGraphPositions) {
        super(board);
        this.graph = graph;
        this.graphPositions = graphPositions;
    }

    canDraw(element: KnowledgeGraphElement): boolean {
        return true;
    }

    draw(element: KnowledgeGraphElement) {
        const nodeG = createG();
        const edges = this.graph.edges();
        edges.forEach(edge => {
            nodeG.append(drawEdge(this.board, this.graph, edge, this.graphPositions));
        });
        return nodeG;
    }
}
