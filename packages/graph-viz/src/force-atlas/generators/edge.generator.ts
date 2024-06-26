import { PlaitBoard, createG } from '@plait/core';
import { Generator } from '@plait/common';
import { ForceAtlasElement } from '../../interfaces';
import Graph from 'graphology';
import { Node, Positions } from '../types';
import { drawEdge } from '../draw';
import { getEdgeDirection, getEdgeInfo } from '../utils';

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
            const source = this.graph.source(edge);
            const target = this.graph.target(edge);
            const startPos = this.graphPositions[source];
            const endPos = this.graphPositions[target];
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
