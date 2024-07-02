import { PlaitBoard, createG } from '@plait/core';
import { Generator } from '@plait/common';
import { ForceAtlasEdgeElement } from '../../interfaces';
import { EdgeDirection, EdgeInfo } from '../types';
import { drawEdge, drawParticle } from '../draw';
import { playEdgeParticleAnimate } from '../utils/edge';

export class ForceAtlasEdgeGenerator extends Generator<ForceAtlasEdgeElement> {
    static key = 'force-atlas-edge';
    particleAnimation?: { stop: () => void; start: () => void };
    constructor(board: PlaitBoard) {
        super(board);
    }

    canDraw(element: ForceAtlasEdgeElement): boolean {
        return true;
    }

    draw(element: ForceAtlasEdgeElement, data: EdgeInfo) {
        const nodeG = createG();
        const edgeElement = drawEdge(data.startPoint, data.endPoint, data.direction, data.isSourceActive && data.isTargetActive);
        nodeG.append(edgeElement.g);
        if (data.direction !== EdgeDirection.NONE) {
            const particle = drawParticle(this.board, data.startPoint, data.direction);
            edgeElement.g.append(particle);
            this.particleAnimation = playEdgeParticleAnimate(edgeElement.path, particle);
        }
        return nodeG;
    }

    destroy(): void {
        this.particleAnimation?.stop();
    }
}
