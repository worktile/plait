import { PlaitBoard, createG } from '@plait/core';
import { Generator } from '@plait/common';
import { ForceAtlasElement } from '../../interfaces';
import Graph from 'graphology';
import { Node } from '../types';
import { drawEdge } from '../draw';
import { getEdgeDirection, getEdgeInfo } from '../utils';

export class EdgeForceAtlasGenerator extends Generator<ForceAtlasElement> {
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
        const edges = this.graph.edges();
        edges.forEach(edge => {
            const source = this.graph.source(edge);
            const target = this.graph.target(edge);
            const startPos = this.graph.getNodeAttribute(source, 'point') || [0, 0];
            const endPos = this.graph.getNodeAttribute(target, 'point') || [0, 0];
            // 起始和结束位置坐标
            const start = { x: startPos[0], y: startPos[1] };
            const end = { x: endPos[0], y: endPos[1] };
            const edgeInfo = getEdgeInfo(this.graph, edge);
            const direction = getEdgeDirection(edgeInfo);
            const isMutual = edgeInfo.isSourceActive && edgeInfo.isTargetActive;
            nodeG.append(drawEdge(this.board, [start.x, start.y], [end.x, end.y], direction, isMutual));
        });
        return nodeG;
    }
}
