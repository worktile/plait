import { PlaitBoard, createG } from '@plait/core';
import { Generator } from '@plait/common';
import { ForceAtlasElement } from '../../interfaces';
import Graph from 'graphology';
import { Node, Positions } from '../types';
import { drawNode } from '../draw';
import { getEdgeDirection, getEdgeInfo } from '../utils';

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
        const activeNodeId = element.nodes.find(f => f.isActive)?.id;
        element.nodes.forEach(node => {
            const isFirstDepth =
                node.isActive ||
                element.edges.some(
                    s => (s.source === activeNodeId && s.target === node.id) || (s.target === activeNodeId && s.source === node.id)
                );
            nodeG.append(drawNode(this.board, node, this.graphPositions[node.id], isFirstDepth));
        });
        return nodeG;
    }
}
