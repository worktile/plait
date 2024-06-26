import { PlaitBoard, createG } from '@plait/core';
import { Generator } from '@plait/common';
import { ForceAtlasElement } from '../../interfaces';
import Graph from 'graphology';
import { EdgeDirection, Node } from '../types';
import { drawEdge, drawParticle } from '../draw';
import { edgeParticleAnimate, getEdgeDirection, getEdgeInfo } from '../utils';

export class EdgeForceAtlasGenerator extends Generator<ForceAtlasElement> {
    graph!: Graph<Node>;
    particleAnimations: Array<{ stop: () => void; start: () => void }> = [];
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
            const edgeElement = drawEdge([start.x, start.y], [end.x, end.y], direction, isMutual);
            nodeG.append(edgeElement.g);
            if (direction !== EdgeDirection.NONE) {
                const particle = drawParticle(this.board, [start.x, start.y], direction);
                edgeElement.g.append(particle);
                this.particleAnimations.push(edgeParticleAnimate(edgeElement.path, particle));
            }
        });
        return nodeG;
    }

    destroy(): void {
        this.particleAnimations.forEach(animation => {
            animation.stop();
        });
    }
}
