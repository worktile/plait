import { PlaitBoard, PlaitNode, createG } from '@plait/core';
import { Generator } from '@plait/common';
import { ForceAtlasEdgeElement, ForceAtlasNodeElement } from '../../interfaces';
import { EdgeDirection } from '../types';
import { drawEdge, drawParticle } from '../draw';
import { getEdgeDirection, getNodeById, playEdgeParticleAnimate } from '../utils';

export class ForceEdgeAtlasGenerator extends Generator<ForceAtlasEdgeElement> {
    particleAnimation?: { stop: () => void; start: () => void };
    constructor(board: PlaitBoard) {
        super(board);
    }

    canDraw(element: ForceAtlasEdgeElement): boolean {
        return true;
    }

    draw(element: ForceAtlasEdgeElement) {
        const parent = PlaitNode.parent(this.board, PlaitBoard.findPath(this.board, element));
        const sourceNode = getNodeById(element.source, parent);
        const targetNode = getNodeById(element.target, parent);
        if (!sourceNode?.points || !targetNode?.points) {
            throw new Error("Source or target node doesn't have points");
        }
        const startPoint = sourceNode.points[0];
        const endPoint = targetNode.points[0];
        const isSourceActive = !!sourceNode.isActive;
        const isTargetActive = !!targetNode.isActive;
        const direction = getEdgeDirection(isSourceActive, isTargetActive);
        const nodeG = createG();
        const edgeElement = drawEdge(startPoint, endPoint, direction, isSourceActive && isTargetActive);
        nodeG.append(edgeElement.g);
        if (direction !== EdgeDirection.NONE) {
            const particle = drawParticle(this.board, startPoint, direction);
            edgeElement.g.append(particle);
            this.particleAnimation = playEdgeParticleAnimate(edgeElement.path, particle);
        }
        return nodeG;
    }

    destroy(): void {
        this.particleAnimation?.stop();
    }
}
