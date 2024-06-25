import { PlaitBoard, createG } from '@plait/core';
import { Generator } from '@plait/common';
import { ForceAtlasElement } from '../../interfaces';
import Graph from 'graphology';
import { Node, Positions } from '../types';
import { drawEdge } from '../draw';

export class EdgeForceAtlasGenerator extends Generator<ForceAtlasElement> {
    graph!: Graph<Node>;
    graphPositions!: Positions;
    constructor(board: PlaitBoard, graph: Graph<Node>, graphPositions: Positions) {
        super(board);
        this.graph = graph;
        this.graphPositions = graphPositions;
    }

    canDraw(element: ForceAtlasElement): boolean {
        return true;
    }

    draw(element: ForceAtlasElement) {
        const nodeG = createG();
        const edges = this.graph.edges();
        edges.forEach(edge => {
            nodeG.append(drawEdge(this.board, this.graph, edge, this.graphPositions));
        });
        return nodeG;
    }
}
