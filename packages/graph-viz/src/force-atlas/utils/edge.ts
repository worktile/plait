import { PlaitElement } from '@plait/core';
import { ForceAtlasEdgeElement, ForceAtlasElement, ForceAtlasNodeElement } from '../../interfaces';
import { EdgeDirection } from '../types';
import { PlaitCommonElementRef, animate, linear } from '@plait/common';
import { ForceAtlasEdgeGenerator } from '../generators/edge.generator';

export function getEdges(forceAtlasElement: ForceAtlasElement, andCallBack?: (edge: ForceAtlasEdgeElement) => boolean) {
    return forceAtlasElement.children?.filter(
        f => ForceAtlasElement.isForceAtlasEdgeElement(f) && (andCallBack?.(f) ?? true)
    ) as ForceAtlasEdgeElement[];
}

export function getEdgeById(id: string, forceAtlasElement: ForceAtlasElement) {
    const edge = getEdges(forceAtlasElement, e => e.id === id)?.[0];
    if (!edge) {
        throw new Error('can not find edge.');
    }
    return edge;
}

export function getEdgesInSourceOrTarget(id: string, forceAtlasElement: ForceAtlasElement) {
    const edges = getEdges(forceAtlasElement, edge => edge.source === id || edge.target === id);
    return edges;
}

export function getEdgeGenerator(edge: ForceAtlasEdgeElement) {
    const edgeRef = PlaitElement.getElementRef<PlaitCommonElementRef>(edge);
    return edgeRef.getGenerator<ForceAtlasEdgeGenerator>(ForceAtlasEdgeGenerator.key);
}

export function getEdgeDirection(isSourceActive: boolean, isTargetActive: boolean) {
    if (isSourceActive) {
        return EdgeDirection.OUT;
    } else if (isTargetActive) {
        return EdgeDirection.IN;
    }
    return EdgeDirection.NONE;
}

export function playEdgeParticleAnimate(path: SVGPathElement, pointG: SVGGElement) {
    const pathLength = path.getTotalLength();
    let anim = animate(
        (t: number) => {
            const point = path.getPointAtLength(t * pathLength);
            pointG.setAttribute('transform', `translate(${point.x}, ${point.y})`);
        },
        1000,
        linear,
        () => {
            anim = playEdgeParticleAnimate(path, pointG);
        }
    );
    return {
        stop: () => {
            anim.stop();
        },
        start: () => {
            anim.start();
        }
    };
}
