import { PlaitBoard, PlaitNode, createG, getSelectedElements } from '@plait/core';
import { Generator } from '@plait/common';
import { ForceAtlasEdgeElement, ForceAtlasElement, ForceAtlasNodeElement } from '../../interfaces';
import { EdgeDirection } from '../types';
import { drawEdge, drawParticle } from '../draw';
import { getIsNodeActive, getNodeById } from '../utils/node';
import { getEdgeDirection, playEdgeParticleAnimate } from '../utils/edge';

export class ForceAtlasEdgeGenerator extends Generator<ForceAtlasEdgeElement> {
    static key = 'force-atlas-edge';
    particleAnimation?: { stop: () => void; start: () => void };
    constructor(board: PlaitBoard) {
        super(board);
    }

    canDraw(element: ForceAtlasEdgeElement): boolean {
        return true;
    }

    draw(element: ForceAtlasEdgeElement) {
        const parent = PlaitNode.parent(this.board, PlaitBoard.findPath(this.board, element)) as ForceAtlasElement;
        const sourceNode = getNodeById(element.source, parent);
        const targetNode = getNodeById(element.target, parent);
        if (!sourceNode?.points || !targetNode?.points) {
            throw new Error("Source or target node doesn't have points");
        }
        const selectElements = getSelectedElements(this.board) as ForceAtlasNodeElement[];
        const startPoint = sourceNode.points[0];
        const endPoint = targetNode.points[0];
        const isSourceActive = getIsNodeActive(sourceNode.id, selectElements);
        const isTargetActive = getIsNodeActive(targetNode.id, selectElements);
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
