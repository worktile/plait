import { PlaitBoard, createG } from '@plait/core';
import { Generator } from '@plait/common';
import { drawNode } from '../../draw/knowledge-graph/node';
import { KnowledgeGraphElement, KnowledgeGraphNode, KnowledgeGraphPositions } from '../../interfaces';
import Graph from 'graphology';

export class NodeKnowledgeGraphGenerator extends Generator<KnowledgeGraphElement> {
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
        element.nodes.forEach(node => {
            nodeG.append(drawNode(this.board, node, this.graphPositions));
        });
        return nodeG;
    }
}
