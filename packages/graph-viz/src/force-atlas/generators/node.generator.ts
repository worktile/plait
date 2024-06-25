import { PlaitBoard, createG } from '@plait/core';
import { Generator } from '@plait/common';
import { ForceAtlasElement } from '../../interfaces';
import Graph from 'graphology';
import { Node, Positions } from '../types';
import { drawNode } from '../draw';

export class NodeForceAtlasGenerator extends Generator<ForceAtlasElement> {
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
        element.nodes.forEach(node => {
            nodeG.append(drawNode(this.board, node, this.graphPositions));
        });
        return nodeG;
    }
}
