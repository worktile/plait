import { PlaitBoard, createG } from '@plait/core';
import { Generator } from '@plait/common';
import { ForceAtlasElement } from '../../interfaces';
import Graph from 'graphology';
import { Node } from '../types';
import { drawNode } from '../draw';
import { getEdgeDirection, getEdgeInfo } from '../utils';

export class NodeForceAtlasGenerator extends Generator<ForceAtlasElement> {
    graph!: Graph<Node>;
    constructor(board: PlaitBoard, graph: Graph<Node>) {
        super(board);
        this.graph = graph;
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
            nodeG.append(drawNode(this.board, node, node.point || [0, 0], isFirstDepth));
        });
        return nodeG;
    }
}
